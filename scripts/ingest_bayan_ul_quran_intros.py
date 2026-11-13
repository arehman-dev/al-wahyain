import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import re
import sqlite3
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed
import time
import os

DB_PATH = 'data/quran_study.db'
BACKUP_PATH = 'data/quran_study.db.bak_bayan_intros'

VOLUMES = [
    ('60135', 'Vol 1'),
    ('60136', 'Vol 2'),
    ('60137', 'Vol 3'),
    ('60138', 'Vol 4'),
    ('60139', 'Vol 5'),
    ('60140', 'Vol 6'),
    ('70140', 'Vol 7')
]

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'X-Requested-With': 'XMLHttpRequest'
}

def post_req(url, data_dict):
    data = urllib.parse.urlencode(data_dict).encode('utf-8')
    req = urllib.request.Request(url, data=data, headers=HEADERS)
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=25) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == 3:
                raise e
            time.sleep(1.5)

def get_all_surah_baabs():
    all_baabs = []
    for bId, vName in VOLUMES:
        html = post_req('https://tanzeemdigitallibrary.com/Home/LoadAbwaab', {'BookId': bId, 'BaabId': '-99'})
        soup = BeautifulSoup(html, 'html.parser')
        for o in soup.find_all('option'):
            val = o.get('value')
            txt = o.get_text(strip=True)
            if any(k in txt for k in ['سُور', 'سور', 'سوُر']):
                all_baabs.append((bId, val, txt))
    return all_baabs

def fetch_surah_intro(surah_num, book_id, baab_id, surah_name):
    # 1. Load pages for this Baab to find selected start page
    html = post_req('https://tanzeemdigitallibrary.com/Home/LoadPagesByAbwaab', {'BookId': book_id, 'BaabId': baab_id})
    soup = BeautifulSoup(html, 'html.parser')
    opts = soup.find_all('option')
    all_pids = [o.get('value') for o in opts]
    selected_pids = [o.get('value') for o in soup.find_all('option', selected=True)]
    
    start_pid = selected_pids[0] if selected_pids else all_pids[0]
    start_idx = all_pids.index(start_pid)

    # For Surah 1: Pages 83357 to 83365 (before {اَلۡحَمۡدُ لِلّٰہِ رَبِّ)
    if surah_num == 1:
        collected_paras = []
        for pid in all_pids[start_idx : start_idx + 10]:
            p_html = post_req('https://tanzeemdigitallibrary.com/Home/LoadPageContent', {'BookId': book_id, 'PageId': pid})
            p_soup = BeautifulSoup(p_html, 'html.parser')
            page_stopped = False
            for p in p_soup.find_all('p'):
                txt = p.get_text(separator=' ', strip=True)
                txt = re.sub(r'\s+', ' ', txt)
                if not txt or txt == 'سُورۃُ الفاتِحۃ':
                    continue
                if pid == '83365' and '{اَلۡحَمۡدُ لِلّٰہِ رَبِّ' in txt:
                    idx = txt.find('{اَلۡحَمۡدُ لِلّٰہِ رَبِّ')
                    before = txt[:idx].strip()
                    if before:
                        collected_paras.append(before)
                    page_stopped = True
                    break
                collected_paras.append(txt)
            if page_stopped:
                break
        return surah_num, surah_name, book_id, baab_id, start_pid, collected_paras

    # For Surahs 2 to 114:
    verse1_pattern = re.compile(r'(?:آیت\s*۱|آیت\s*۱|آیت\s*1|آیات\s*۱\s*تا|آیات\s*۱\s*تا|آیات\s*1\s*تا|(?<!\d)﴿۱﴾|(?<!\d)﴿1﴾|(?<!\d)\{۱\}|(?<!\d)\{1\})')
    
    collected_paras = []
    intro_started = False

    for pid in all_pids[start_idx : start_idx + 8]:
        p_html = post_req('https://tanzeemdigitallibrary.com/Home/LoadPageContent', {'BookId': book_id, 'PageId': pid})
        p_soup = BeautifulSoup(p_html, 'html.parser')
        page_stopped = False
        paras = p_soup.find_all('p')
        for p in paras:
            txt = p.get_text(separator=' ', strip=True)
            txt = re.sub(r'\s+', ' ', txt)
            if not txt:
                continue

            if txt.startswith('بیانُ القُرآن سُورۃُ') or txt.startswith('بیان القرآن حصہ'):
                continue

            if 'تمہیدی کلمات' in txt:
                intro_started = True

            if not intro_started:
                if any(k in txt for k in ['سُورۃ', 'سورۃ', 'مکی', 'مدنی', 'نظم', 'شمار']):
                    intro_started = True

            if intro_started:
                m = verse1_pattern.search(txt)
                if m:
                    before = txt[:m.start()].strip()
                    before = re.sub(r'^سُورۃ[^\n]*?تمہیدی کلمات', '', before).strip()
                    if len(before) > 15:
                        collected_paras.append(before)
                    page_stopped = True
                    break
                else:
                    clean_p = re.sub(r'^سُورۃ[^\n]*?تمہیدی کلمات', '', txt).strip()
                    clean_p = clean_p.replace('تمہیدی کلمات', '').strip()
                    if clean_p and len(clean_p) > 5:
                        collected_paras.append(clean_p)

        if page_stopped:
            break

    # Clean collected paragraphs
    refined_paras = []
    for p in collected_paras:
        p_clean = p.strip()
        # Remove standalone Surah title or Bismillah
        if re.match(r'^(?:سُورَ?ۃُ?\s+[\w\sـّٰٓٔء-ۿ]+|بِسۡ?مِ\s+اللّٰ?ہِ\s+الرَّحۡمٰنِ\s+الرَّحِیۡمِ|بسم\s+اللہ\s+الرحمن\s+الرحیم)$', p_clean):
            continue
        # Remove leading surah title prefix
        p_clean = re.sub(r'^سُورَ?ۃُ?\s+[\w\sـّٰٓٔء-ۿ]+?\s+(?=سورۃ|قرآن|مکی|مدنی|یہ|اس)', '', p_clean).strip()
        # Remove trailing Bismillah if it was just followed by verse 1
        p_clean = re.sub(r'\s*(?:بِسۡ?مِ\s+اللّٰ?ہِ\s+الرَّحۡمٰنِ\s+الرَّحِیۡمِ|بسم\s+اللہ\s+الرحمن\s+الرحیم)\s*$', '', p_clean).strip()
        # Filter out verse text brackets { ... } without urdu commentary
        if p_clean.startswith('{') and '}' in p_clean and len(p_clean) < 300 and not any(w in p_clean for w in ['ہے', 'ہیں', 'تھا', 'تھی', 'کہ', 'سے', 'کا', 'کی', 'کے']):
            continue
        if len(p_clean) > 20:
            refined_paras.append(p_clean)

    return surah_num, surah_name, book_id, baab_id, start_pid, refined_paras

def main():
    print("=== Step 1: Backup Database ===")
    if not os.path.exists(BACKUP_PATH):
        shutil.copy2(DB_PATH, BACKUP_PATH)
        print(f"Created backup at {BACKUP_PATH}")
    else:
        print(f"Backup already exists at {BACKUP_PATH}")

    print("\n=== Step 2: Map All 114 Surahs ===")
    baabs = get_all_surah_baabs()
    print(f"Total mapped Surahs: {len(baabs)}")
    assert len(baabs) == 114

    print("\n=== Step 3: Fetch Authentic Intros from Tanzeem Digital Library ===")
    scraped_results = {}
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(fetch_surah_intro, idx, bId, val, txt): idx
            for idx, (bId, val, txt) in enumerate(baabs, 1)
        }
        for future in as_completed(futures):
            surah_num, surah_name, book_id, baab_id, start_pid, paras = future.result()
            scraped_results[surah_num] = {
                'name': surah_name,
                'book_id': book_id,
                'baab_id': baab_id,
                'start_pid': start_pid,
                'paras': paras,
                'total_chars': sum(len(p) for p in paras)
            }
            status = f"{len(paras)} paras ({scraped_results[surah_num]['total_chars']} chars)" if paras else "No standalone intro"
            print(f"[{surah_num:3d}/114] {surah_name:25s} -> {status}")

    print("\n=== Step 4: Insert Into Database ===")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Clean existing Bayan Ayah 0 intros if any
    cursor.execute("DELETE FROM tafasir WHERE tafsir_slug = 'bayan_ul_quran' AND ayah_from = 0")
    deleted_old = cursor.rowcount
    print(f"Purged {deleted_old} old Bayan Ayah 0 entries.")

    inserted_count = 0
    for num in range(1, 115):
        data = scraped_results[num]
        paras = data['paras']
        if not paras:
            continue

        # Format HTML
        html_paras = ''.join(f'<p class="mb-4 leading-relaxed">{p}</p>' for p in paras)
        content_html = f'<h2>تمہیدی کلمات:</h2>\n{html_paras}'
        source_url = f"https://tanzeemdigitallibrary.com/Book/bayan-ul-quran/11/{data['book_id']}/{data['baab_id']}/{data['start_pid']}"

        cursor.execute('''
            INSERT INTO tafasir (
                tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to,
                title, content_html, footnotes_json, source_attribution, source_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            'bayan_ul_quran',
            'بیان القرآن',
            'ڈاکٹر اسرار احمد',
            num,
            0,
            0,
            'تمہیدی کلمات',
            content_html,
            '[]',
            'تنظیم اسلامی ڈیجیٹل لائبریری (tanzeemdigitallibrary.com)',
            source_url
        ))
        inserted_count += 1

    print(f"Successfully inserted {inserted_count} authentic Bayan-ul-Quran Surah Introductions into Ayah 0.")

    # 2. Update Surah 1 Ayah 1 for Bayan-ul-Quran (trim redundant 17KB lecture out of verse 1)
    s1_v1_trimmed_html = (
        '<p class="mb-4 leading-relaxed">بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ</p>'
        '<p class="mb-4 leading-relaxed">ڈاکٹر اسرار احمد رحمہ اللہ نے بیان القرآن میں سورۃ الفاتحہ کے آغاز میں تمہیدی کلمات کے تحت سورت کے مجموعی تعارف، ناموں اور اس کی عظمت و اساسیت کو مفصل انداز میں بیان فرمایا ہے۔ (تفصیل کے لیے ملاحظہ فرمائیں: 0-intro / تمہیدی کلمات)۔</p>'
        '<p class="mb-4 leading-relaxed">نیز لفظِ جلالہ ’’اللّٰہ‘‘ اور صفاتِ عالیہ ’’الرَّحْمٰنِ الرَّحِیْمِ‘‘ کی جامع لغوی و ایمانی تشریح کے لیے اگلی آیات (آیت ۲ و ۳) کی تفسیر ملاحظہ فرمائیں۔</p>'
    )
    cursor.execute('''
        UPDATE tafasir 
        SET content_html = ? 
        WHERE tafsir_slug = 'bayan_ul_quran' AND surah_id = 1 AND ayah_from = 1
    ''', (s1_v1_trimmed_html,))
    print(f"Updated Surah 1 Ayah 1 commentary: {cursor.rowcount} row updated.")

    conn.commit()

    # Verification query
    cursor.execute("SELECT count(*) FROM tafasir")
    total_tafasir = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM tafasir WHERE ayah_from = 0")
    total_ayah0 = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM tafasir WHERE ayah_from = 0 AND tafsir_slug = 'bayan_ul_quran'")
    total_bayan_ayah0 = cursor.fetchone()[0]
    cursor.execute("SELECT count(*) FROM tafasir WHERE ayah_from = 0 AND tafsir_slug = 'tafheem'")
    total_tafheem_ayah0 = cursor.fetchone()[0]

    print("\n=== Step 5: Database Verification ===")
    print(f"Total rows in tafasir table: {total_tafasir}")
    print(f"Total Ayah 0 intros: {total_ayah0} (Tafheem: {total_tafheem_ayah0}, Bayan: {total_bayan_ayah0})")
    conn.close()

if __name__ == '__main__':
    main()
