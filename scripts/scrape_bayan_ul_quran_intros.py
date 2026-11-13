import urllib.request
import urllib.parse
from bs4 import BeautifulSoup
import re
import sqlite3
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

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
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=20) as resp:
                return resp.read().decode('utf-8', errors='ignore')
        except Exception as e:
            if attempt == 2:
                raise e
            time.sleep(1)

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

def extract_surah_intro(surah_num, book_id, baab_id, surah_name):
    # 1. Load pages for this Baab to find selected start page
    html = post_req('https://tanzeemdigitallibrary.com/Home/LoadPagesByAbwaab', {'BookId': book_id, 'BaabId': baab_id})
    soup = BeautifulSoup(html, 'html.parser')
    opts = soup.find_all('option')
    all_pids = [o.get('value') for o in opts]
    selected_pids = [o.get('value') for o in soup.find_all('option', selected=True)]
    
    if not selected_pids:
        # Fallback to first page
        start_pid = all_pids[0]
    else:
        start_pid = selected_pids[0]
        
    start_idx = all_pids.index(start_pid)

    # For Surah 1: traverse up to page 83365 (before {اَلۡحَمۡدُ لِلّٰہِ رَبِّ الۡعٰلَمِیۡنَ)
    if surah_num == 1:
        collected_paras = []
        # Pages 100 to 108: 83356 to 83365
        for pid in all_pids[start_idx : start_idx + 10]:
            p_html = post_req('https://tanzeemdigitallibrary.com/Home/LoadPageContent', {'BookId': book_id, 'PageId': pid})
            p_soup = BeautifulSoup(p_html, 'html.parser')
            page_stopped = False
            for p in p_soup.find_all('p'):
                txt = p.get_text(separator=' ', strip=True)
                txt = re.sub(r'\s+', ' ', txt)
                if not txt or txt == 'سُورۃُ الفاتِحۃ':
                    continue
                # If verse 1 commentary begins:
                if '{اَلۡحَمۡدُ لِلّٰہِ رَبِّ' in txt:
                    # Capture text before it if any
                    idx = txt.find('{اَلۡحَمۡدُ لِلّٰہِ رَبِّ')
                    before = txt[:idx].strip()
                    if before:
                        collected_paras.append(before)
                    page_stopped = True
                    break
                collected_paras.append(txt)
            if page_stopped:
                break
        return surah_num, surah_name, book_id, start_pid, collected_paras

    # For Surahs 2 to 114:
    # Verse 1 marker patterns:
    # Look for Ayat 1 marker or verse {1}
    verse1_pattern = re.compile(r'(?:آیت\s*۱|آیت\s*۱|آیت\s*1|آیات\s*۱\s*تا|آیات\s*۱\s*تا|آیات\s*1\s*تا|(?<!\d)﴿۱﴾|(?<!\d)﴿1﴾|(?<!\d)\{۱\}|(?<!\d)\{1\})')
    
    collected_paras = []
    intro_started = False

    # Most intros are 1 to 4 pages. Check up to 8 pages.
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

            # Strip book header boilerplate like "بیانُ القُرآن سُورۃُ..."
            if txt.startswith('بیانُ القُرآن سُورۃُ') or txt.startswith('بیان القرآن حصہ'):
                continue

            # Check if intro indicator or title is here
            if 'تمہیدی کلمات' in txt:
                intro_started = True

            # If intro hasn't marked started yet, but this is the first page of the surah
            if not intro_started:
                # If it mentions the surah name or intro keywords, mark started
                if any(k in txt for k in ['سُورۃ', 'سورۃ', 'مکی', 'مدنی', 'نظم', 'شمار']):
                    intro_started = True

            if intro_started:
                m = verse1_pattern.search(txt)
                if m:
                    # Verse 1 starts here!
                    before = txt[:m.start()].strip()
                    # Clean up header
                    before = re.sub(r'^سُورۃ[^\n]*?تمہیدی کلمات', '', before).strip()
                    if len(before) > 15:
                        collected_paras.append(before)
                    page_stopped = True
                    break
                else:
                    # Clean paragraph
                    clean_p = re.sub(r'^سُورۃ[^\n]*?تمہیدی کلمات', '', txt).strip()
                    clean_p = clean_p.replace('تمہیدی کلمات', '').strip()
                    if clean_p and len(clean_p) > 5:
                        collected_paras.append(clean_p)

        if page_stopped:
            break

    return surah_num, surah_name, book_id, start_pid, collected_paras

def main():
    print("Mapping all Surah Baabs...")
    baabs = get_all_surah_baabs()
    print(f"Total mapped: {len(baabs)}")
    assert len(baabs) == 114

    results = {}
    print("Scraping intros in parallel...")
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = {
            executor.submit(extract_surah_intro, idx, bId, val, txt): idx
            for idx, (bId, val, txt) in enumerate(baabs, 1)
        }
        for future in as_completed(futures):
            surah_num, surah_name, book_id, start_pid, paras = future.result()
            results[surah_num] = {
                'name': surah_name,
                'book_id': book_id,
                'start_pid': start_pid,
                'paras': paras,
                'total_chars': sum(len(p) for p in paras)
            }
            print(f"[{surah_num:3d}/114] {surah_name:25s} -> {len(paras):2d} paras ({results[surah_num]['total_chars']:5d} chars)")

    # Analyze results
    print("\n" + "="*60)
    print("ANALYSIS OF SCRAPED INTROS:")
    empty_surahs = []
    short_surahs = []
    for num in range(1, 115):
        r = results[num]
        if len(r['paras']) == 0:
            empty_surahs.append((num, r['name']))
        elif r['total_chars'] < 100:
            short_surahs.append((num, r['name'], r['total_chars']))

    print(f"Empty Surahs ({len(empty_surahs)}): {empty_surahs}")
    print(f"Short Surahs < 100 chars ({len(short_surahs)}): {short_surahs}")

    # Save to a temporary JSON file for verification before DB insertion
    import json
    with open('/tmp/bayan_intros_raw.json', 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    print("Saved raw output to /tmp/bayan_intros_raw.json")

if __name__ == '__main__':
    main()
