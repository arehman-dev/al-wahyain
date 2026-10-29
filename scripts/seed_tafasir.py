#!/usr/bin/env python3
import sqlite3
import urllib.request
import json
import os
import re
import html
import time

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
    # Strip any header noise like "Tafseer · Maarif-ul-Quran"
    cleaned = re.sub(r'Tafseer\s*·\s*[A-Za-z0-9\-\s]+', '\n\n', raw_text)
    # Split into paragraphs and remove empty lines
    paras = [p.strip() for p in cleaned.split('\n') if p.strip()]
    return "<p class='mb-4 leading-relaxed'>" + "</p><p class='mb-4 leading-relaxed'>".join(paras) + "</p>"

def fetch_eql_tafsir(slug, surah, ayah):
    url = f"https://www.equranlibrary.com/tafseer/{slug}/{surah}/{ayah}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            all_p = re.findall(r'<p[^>]*>(.*?)</p>', content, re.DOTALL)
            m = [p for p in all_p if any('\u0600' <= c <= '\u06FF' for c in p)]
            clean_paras = [re.sub(r'<[^>]+>', '', p).strip() for p in m]
            clean_paras = [p for p in clean_paras if len(p) > 25 and not p.startswith('eQuran')]
            if clean_paras:
                # If first paragraph is verse arabic text or translation, skip or keep as needed
                body = "\n\n".join(clean_paras)
                return clean_tafsir_text(body)
    except Exception as e:
        print(f"Error fetching EQL {slug} {surah}:{ayah} - {e}")
    return ""

def fetch_quran_com_tafsir(tafsir_id, surah, ayah):
    url = f"https://api.quran.com/api/v4/tafsirs/{tafsir_id}/by_ayah/{surah}:{ayah}"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=12) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            t = data.get('tafsir', {})
            raw_html = t.get('text', '')
            if raw_html:
                return raw_html
    except Exception as e:
        print(f"Error fetching Quran.com tafsir {tafsir_id} {surah}:{ayah} - {e}")
    return ""

def seed_tafasir_for_surah(surah_id, max_ayahs=None):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Get available ayahs for this surah in our DB
    cursor.execute("SELECT ayah_number FROM ayahs WHERE surah_id = ? ORDER BY ayah_number", (surah_id,))
    ayah_numbers = [row[0] for row in cursor.fetchall()]
    if max_ayahs:
        ayah_numbers = ayah_numbers[:max_ayahs]

    print(f"\n--- Seeding Tafasir for Surah {surah_id} ({len(ayah_numbers)} Ayahs) ---")

    for a_num in ayah_numbers:
        print(f"  Fetching 4 Tafasir for Ayah {surah_id}:{a_num}...")
        for cfg in TAFASIR_CONFIG:
            slug = cfg["slug"]
            name = cfg["name"]
            author = cfg["author"]
            source = cfg["source"]
            source_url = cfg["source_url"]

            content = ""
            if slug == "ibn_kathir":
                content = fetch_quran_com_tafsir(cfg["quran_com_id"], surah_id, a_num)
            else:
                content = fetch_eql_tafsir(cfg["eql_slug"], surah_id, a_num)

            if content:
                cursor.execute("""
                    INSERT OR REPLACE INTO tafasir
                    (tafsir_slug, tafsir_name, author_name, surah_id, ayah_from, ayah_to, title, content_html, footnotes_json, source_attribution, source_url)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (slug, name, author, surah_id, a_num, a_num, f"{name} • آیت {a_num}", content, "[]", source, source_url))
        conn.commit()
        time.sleep(0.1)

    conn.close()
    print(f"Tafasir seeded successfully for Surah {surah_id}!")

def main():
    # Seed Surah 1 (All 7 ayahs) with all 4 Tafasir
    seed_tafasir_for_surah(1)
    # Seed Surah 2 (First 7 ayahs)
    seed_tafasir_for_surah(2, max_ayahs=7)
    print("\nTafasir seeding completed!")

if __name__ == "__main__":
    main()
