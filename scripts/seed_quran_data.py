#!/usr/bin/env python3
import sqlite3
import urllib.request
import json
import os
import re

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "quran_study.db")
MORPHOLOGY_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "morphology.txt")

BW_MAP = {
    'A': 'ا', 'b': 'ب', 't': 'ت', 'v': 'ث', 'j': 'ج', 'H': 'ح', 'x': 'خ',
    'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س', '$': 'ش', 'S': 'ص',
    'D': 'ض', 'T': 'ط', 'Z': 'ظ', 'E': 'ع', 'g': 'غ', 'f': 'ف', 'q': 'ق',
    'k': 'ك', 'l': 'ل', 'm': 'م', 'n': 'ن', 'h': 'ه', 'w': 'و', 'Y': 'ى',
    'y': 'ي', '{': 'ا', '\'': 'ء', '>': 'أ', '<': 'إ', '&': 'ؤ', '}': 'ئ',
    '`': 'ٰ'
}

POS_TRADITIONAL_MAP = {
    'N': 'اسم',
    'PN': 'اسم علم',
    'V': 'فعل',
    'P': 'حرف جر',
    'DET': 'أداة تعريف',
    'PRON': 'ضمير',
    'DEM': 'اسم إشارة',
    'REL': 'اسم موصول',
    'ADJ': 'صفة / نعت',
    'CONJ': 'حرف عطف',
    'NEG': 'حرف نفي',
    'SUB': 'حرف مصدري',
    'COND': 'حرف شرط',
    'INTG': 'اسم استفهام',
    'VOC': 'حرف نداء',
    'RES': 'أداة حصر',
    'EXP': 'أداة استثناء',
    'INC': 'حرف ابتداء',
    'SUR': 'حرف فجاءة',
    'ACC': 'حرف مشبه بالفعل'
}

GRAMMAR_FEATURES_MAP = {
    'NOM': 'مرفوع',
    'ACC': 'منصوب',
    'GEN': 'مجرور',
    'JUS': 'مجزوم',
    'IND': 'مرفوع',
    'PERF': 'ماضٍ',
    'IMPF': 'مضارع',
    'IMPV': 'أمر',
    'PASS': 'مبني للمجهول',
    'ACT': 'مبني للمعلوم',
    'M': 'مذكر',
    'MS': 'مفرد مذكر',
    'F': 'مؤنث',
    'FS': 'مفرد مؤنث',
    'MD': 'مثنى مذكر',
    'FD': 'مثنى مؤنث',
    'MP': 'جمع مذكر',
    'FP': 'جمع مؤنث',
    '1S': 'متكلم مفرد',
    '1P': 'متكلم جمع',
    '2MS': 'مخاطب مفرد مذكر',
    '2FS': 'مخاطب مفرد مؤنث',
    '2D': 'مخاطب مثنى',
    '2MP': 'مخاطب جمع مذكر',
    '3MS': 'غائب مفرد مذكر',
    '3FS': 'غائب مفرد مؤنث',
    '3D': 'غائب مثنى',
    '3MP': 'غائب جمع مذكر'
}

def bw_to_ar(s):
    if not s:
        return None
    return ''.join(BW_MAP.get(c, c) for c in s)

def load_morphology_cache():
    print("Loading Quranic Corpus morphology index...")
    morph_data = {}
    root_counts = {}
    
    if not os.path.exists(MORPHOLOGY_FILE):
        print(f"Warning: {MORPHOLOGY_FILE} not found!")
        return morph_data, root_counts

    with open(MORPHOLOGY_FILE, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            parts = line.split('\t')
            if len(parts) < 4:
                continue
            loc_str, form, tag, features = parts[0], parts[1], parts[2], parts[3]
            m = re.match(r'\((\d+):(\d+):(\d+):(\d+)\)', loc_str)
            if not m:
                continue
            s_id, a_id, w_id, seg_id = int(m.group(1)), int(m.group(2)), int(m.group(3)), int(m.group(4))
            word_key = f"{s_id}:{a_id}:{w_id}"
            
            root_m = re.search(r'ROOT:([a-zA-Z\<\>\&\*]+)', features)
            root_raw = root_m.group(1) if root_m else None
            root_ar = bw_to_ar(root_raw) if root_raw else None
            
            lem_m = re.search(r'LEM:([^\s\|]+)', features)
            lem_raw = lem_m.group(1) if lem_m else None
            lem_ar = bw_to_ar(lem_raw) if lem_raw else None

            attr_list = []
            if tag in POS_TRADITIONAL_MAP:
                attr_list.append(POS_TRADITIONAL_MAP[tag])
            for feat_part in features.split('|'):
                if feat_part in GRAMMAR_FEATURES_MAP:
                    attr_list.append(GRAMMAR_FEATURES_MAP[feat_part])

            if root_ar:
                root_counts[root_ar] = root_counts.get(root_ar, 0) + 1

            if word_key not in morph_data:
                morph_data[word_key] = {
                    "root": root_ar,
                    "root_raw": root_raw,
                    "lemma": lem_ar,
                    "pos_tag": POS_TRADITIONAL_MAP.get(tag, tag),
                    "features": attr_list,
                    "segments": []
                }
            else:
                if not morph_data[word_key]["root"] and root_ar:
                    morph_data[word_key]["root"] = root_ar
                    morph_data[word_key]["root_raw"] = root_raw
                if not morph_data[word_key]["lemma"] and lem_ar:
                    morph_data[word_key]["lemma"] = lem_ar
                morph_data[word_key]["features"].extend(attr_list)

            morph_data[word_key]["segments"].append({
                "seg": seg_id,
                "form_ar": bw_to_ar(form),
                "tag": POS_TRADITIONAL_MAP.get(tag, tag),
                "features": attr_list
            })

    print(f"Morphology loaded: {len(morph_data)} words, {len(root_counts)} unique roots.")
    return morph_data, root_counts

def fetch_json(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read().decode("utf-8"))

def seed_surah_data(surah_id, morph_cache, root_counts, conn, max_ayahs=None):
    cursor = conn.cursor()
    print(f"\n--- Seeding Surah {surah_id} ---")

    # 1. Fetch Tajweed text
    print(f"Fetching Tajweed text for Surah {surah_id}...")
    tajweed_url = f"https://api.quran.com/api/v4/quran/verses/uthmani_tajweed?chapter_number={surah_id}"
    tajweed_data = fetch_json(tajweed_url).get("verses", [])
    tajweed_map = {v["verse_key"]: v["text_uthmani_tajweed"] for v in tajweed_data}

    # 2. Fetch Indo-Pak text
    print(f"Fetching Indo-Pak text for Surah {surah_id}...")
    indopak_url = f"https://api.quran.com/api/v4/quran/verses/indopak?chapter_number={surah_id}"
    indopak_data = fetch_json(indopak_url).get("verses", [])
    indopak_map = {v["verse_key"]: v["text_indopak"] for v in indopak_data}

    # 3. Fetch Verses with words and translations
    per_page = max_ayahs if max_ayahs else 300
    verses_url = f"https://api.quran.com/api/v4/verses/by_chapter/{surah_id}?words=true&word_fields=location,text_uthmani,text_indopak,translation,transliteration,page_number&translations=234,233,97,131&per_page={per_page}"
    print(f"Fetching verses, translations, and words for Surah {surah_id}...")
    verses_data = fetch_json(verses_url).get("verses", [])
    if max_ayahs:
        verses_data = verses_data[:max_ayahs]

    # Fetch Urdu word-by-word
    urdu_wbw_url = f"https://api.quran.com/api/v4/verses/by_chapter/{surah_id}?words=true&word_fields=location,translation&language=ur&per_page={per_page}"
    print(f"Fetching Urdu word-by-word for Surah {surah_id}...")
    urdu_wbw_data = fetch_json(urdu_wbw_url).get("verses", [])
    urdu_word_map = {}
    for uv in urdu_wbw_data:
        for uw in uv.get("words", []):
            loc = uw.get("location")
            if loc and uw.get("translation"):
                urdu_word_map[loc] = uw["translation"].get("text", "")

    # Fetch audio timestamps for first 15 verses
    audio_map = {}
    audio_sample_limit = min(len(verses_data), 15)
    print(f"Fetching precise word timestamps for first {audio_sample_limit} verses...")
    for v in verses_data[:audio_sample_limit]:
        vk = v["verse_key"]
        try:
            a_url = f"https://api.quran.com/api/v4/verses/by_key/{vk}?words=true&audio=7"
            a_data = fetch_json(a_url).get("verse", {})
            audio_info = a_data.get("audio", {})
            if audio_info:
                audio_map[vk] = {
                    "url": audio_info.get("url"),
                    "segments": json.dumps(audio_info.get("segments", []))
                }
        except Exception:
            pass

    # Insert into Database
    for v in verses_data:
        vk = v["verse_key"]
        v_num = v["verse_number"]
        page_madani = v.get("page_number", 1)
        page_indopak = page_madani

        text_uthmani = v.get("text_uthmani", "")
        text_indopak = indopak_map.get(vk, text_uthmani)
        text_tajweed = tajweed_map.get(vk, text_uthmani)

        s_str = str(surah_id).zfill(3)
        a_str = str(v_num).zfill(3)
        default_audio_url = f"https://verses.quran.com/Alafasy/mp3/{s_str}{a_str}.mp3"
        
        a_info = audio_map.get(vk, {"url": default_audio_url, "segments": "[]"})
        audio_url_final = a_info["url"] if a_info["url"].startswith("http") else f"https://verses.quran.com/{a_info['url']}"

        cursor.execute("""
            INSERT OR REPLACE INTO ayahs
            (surah_id, ayah_number, verse_key, text_uthmani, text_indopak, text_tajweed, page_madani, page_indopak, audio_url, audio_segments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (surah_id, v_num, vk, text_uthmani, text_indopak, text_tajweed, page_madani, page_indopak, audio_url_final, a_info["segments"]))

        # Insert Translations
        trans_authors = {
            234: ("taqi_usmani", "مفتی تقی عثمانی", "ur"),
            233: ("jalandhari", "مولانا فتح محمد جالندھری", "ur"),
            97:  ("maududi", "مولانا سید ابوالاعلیٰ مودودی", "ur"),
            131: ("sahih_int", "Saheeh International", "en")
        }
        for tr in v.get("translations", []):
            res_id = tr.get("resource_id")
            if res_id in trans_authors:
                auth_id, auth_name, lang = trans_authors[res_id]
                clean_text = re.sub(r'<[^>]+>', '', tr.get("text", "")).strip()
                cursor.execute("""
                    INSERT OR REPLACE INTO translations
                    (surah_id, ayah_number, author_id, author_name, language, text)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (surah_id, v_num, auth_id, auth_name, lang, clean_text))

        # Insert Words
        for w in v.get("words", []):
            if w.get("char_type_name") != "word":
                continue
            pos = w.get("position", 1)
            loc = w.get("location", f"{surah_id}:{v_num}:{pos}")
            w_uthmani = w.get("text_uthmani") or w.get("text", "")
            w_indopak = w.get("text_indopak") or w_uthmani
            trans_en = w.get("translation", {}).get("text", "")
            trans_ur = urdu_word_map.get(loc, "")
            audio_url = w.get("audio_url", "")

            morph = morph_cache.get(loc, {})
            root = morph.get("root")
            lemma = morph.get("lemma")
            pos_tag = morph.get("pos_tag")
            unique_features = list(dict.fromkeys(morph.get("features", [])))
            grammar_str = " • ".join(unique_features) if unique_features else (pos_tag or "")

            cursor.execute("""
                INSERT OR REPLACE INTO words
                (surah_id, ayah_number, position, location, text_uthmani, text_indopak, translation_ur, translation_en, audio_url, root, lemma, pos_tag, grammar_details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (surah_id, v_num, pos, loc, w_uthmani, w_indopak, trans_ur, trans_en, audio_url, root, lemma, pos_tag, grammar_str))

    # Seed Roots
    for root_ar, count in root_counts.items():
        cursor.execute("""
            INSERT OR IGNORE INTO roots (root, root_arabic, occurrences_count)
            VALUES (?, ?, ?)
        """, (root_ar, root_ar, count))

    conn.commit()
    print(f"Surah {surah_id} seeded successfully! ({len(verses_data)} ayahs)")

def main():
    conn = sqlite3.connect(DB_PATH)
    morph_cache, root_counts = load_morphology_cache()
    
    # Seed Surah 1 (All 7 ayahs)
    seed_surah_data(1, morph_cache, root_counts, conn)
    # Seed Surah 2 (First 35 ayahs including foundational sections)
    seed_surah_data(2, morph_cache, root_counts, conn, max_ayahs=35)
    
    conn.close()
    print("\nQuran baseline data seeding completed!")

if __name__ == "__main__":
    main()
