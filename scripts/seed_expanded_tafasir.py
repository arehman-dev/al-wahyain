#!/usr/bin/env python3
import sqlite3
import urllib.request
import json
import os
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "quran_study.db")

TAFASIR_CONFIG = [
    {
        "slug": "tafheem",
        "name": "تفہیم القرآن",
        "author": "مولانا سید ابوالاعلیٰ مودودی",
        "source": "ReadMaududi & eQuranLibrary",
        "source_url": "https://www.readmaududi.com",
        "eql_slug": "tafheemulquran"
    },
    {
        "slug": "maarif",
        "name": "معارف القرآن",
        "author": "مفتی محمد شفیع عثمانی",
        "source": "Easy Quran wa Hadees & eQuranLibrary",
        "source_url": "https://www.equranlibrary.com",
        "eql_slug": "maarifulquran"
    },
    {
        "slug": "ibn_kathir",
        "name": "تفسیر ابنِ کثیر (اردو)",
        "author": "حافظ عماد الدین ابنِ کثیر",
        "source": "Quran.com & Darussalam",
        "source_url": "https://quran.com",
        "quran_com_id": 160
    },
    {
        "slug": "tayseer",
        "name": "تیسیر القرآن",
        "author": "مولانا عبدالرحمٰن کیلانی",
        "source": "Idara Tarjuman-ul-Islam & eQuranLibrary",
        "source_url": "https://www.equranlibrary.com",
        "eql_slug": "taiseerulquran"
    }
]

def clean_tafsir_text(raw_text):
    if not raw_text:
        return ""
    cleaned = re.sub(r'Tafseer\s*·\s*[A-Za-z0-9\-\s]+', '\n\n', raw_text)
    paras = [p.strip() for p in cleaned.split('\n') if p.strip()]
    return "<p class='mb-4 leading-relaxed'>" + "</p><p class='mb-4 leading-relaxed'>".join(paras) + "</p>"

def fetch_eql_tafsir(slug, surah, ayah):
    url = f"https://www.equranlibrary.com/tafseer/{slug}/{surah}/{ayah}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            all_p = re.findall(r'<p[^>]*>(.*?)</p>', content, re.DOTALL)
            m = [p for p in all_p if any('\u0600' <= c <= '\u06FF' for c in p)]
            clean_paras = [re.sub(r'<[^>]+>', '', p).strip() for p in m]
            clean_paras = [p for p in clean_paras if len(p) > 25 and not p.startswith('eQuran')]
            if clean_paras:
                body = "\n\n".join(clean_paras)
                return clean_tafsir_text(body)
    except Exception:
        pass
    return ""

def fetch_quran_com_tafsir(tafsir_id, surah, ayah):
    url = f"https://api.quran.com/api/v4/tafsirs/{tafsir_id}/by_ayah/{surah}:{ayah}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            t = data.get('tafsir', {})
            raw_html = t.get('text', '')
            if raw_html:
                return raw_html
    except Exception:
        pass
    return ""

def fetch_single_tafsir(surah_id, ayah_num, cfg):
    slug = cfg["slug"]
    if slug == "ibn_kathir":
        content = fetch_quran_com_tafsir(cfg["quran_com_id"], surah_id, ayah_num)
    else:
        content = fetch_eql_tafsir(cfg["eql_slug"], surah_id, ayah_num)
    return (surah_id, ayah_num, cfg, content)

def seed_surah_tafasir(surah_id, existing_keys):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT ayah_number FROM ayahs WHERE surah_id = ? ORDER BY ayah_number", (surah_id,))
    ayah_numbers = [row[0] for row in cursor.fetchall()]

    tasks = []
    for a_num in ayah_numbers:
        for cfg in TAFASIR_CONFIG:
            key = (surah_id, a_num, cfg["slug"])
            if key not in existing_keys:
                tasks.append((surah_id, a_num, cfg))

    print(f"\nSeeding {len(tasks)} missing Tafasir entries for Surah {surah_id} ({len(ayah_numbers)} ayahs)...")
    if not tasks:
        print(f"All tafasir already seeded for Surah {surah_id}.")
        conn.close()
        return

    inserted = 0
    # Use ThreadPoolExecutor with 8 workers
    with ThreadPoolExecutor(max_workers=8) as executor:
        futures = [executor.submit(fetch_single_tafsir, s_id, a_num, cfg) for s_id, a_num, cfg in tasks]
        for f in as_completed(futures):
            s_id, a_num, cfg, content = f.result()
            if content:
                cursor.execute("""
                    INSERT OR REPLACE INTO tafasir
                    (tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to, title, content_html, footnotes_json, source_attribution, source_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (cfg["slug"], cfg["name"], cfg["author"], s_id, a_num, a_num, f"{cfg['name']} • آیت {a_num}", content, "[]", cfg["source"], cfg["source_url"]))
                inserted += 1
                if inserted % 20 == 0:
                    conn.commit()
                    print(f"  Saved {inserted}/{len(tasks)} tafasir for Surah {surah_id}...")

    conn.commit()
    conn.close()
    print(f"✅ Finished Surah {surah_id}: {inserted} tafasir saved!")

def main():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT surah_id, ayah_from, tafsir_slug FROM tafasir")
    existing_keys = set((row[0], row[1], row[2]) for row in cursor.fetchall())
    conn.close()

    print(f"Found {len(existing_keys)} existing tafasir records in DB.")
    
    # Priority order: 56, 57, 2, 3, 4
    for s_id in [56, 57, 2, 3, 4]:
        seed_surah_tafasir(s_id, existing_keys)

    print("\n🎉 All Tafasir ingestion completed!")

if __name__ == "__main__":
    main()
