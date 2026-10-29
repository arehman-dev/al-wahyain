#!/usr/bin/env python3
import sqlite3
import urllib.request
import json
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "quran_study.db")

URDU_SURAH_NAMES = [
    "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
    "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
    "الأنبیاء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
    "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
    "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
    "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
    "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
    "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
    "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
    "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
    "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
    "المسد", "الإخلاص", "الفلق", "الناس"
]

def seed_surahs():
    print("Fetching Surahs metadata from Quran.com API...")
    url = "https://api.quran.com/api/v4/chapters?language=ur"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        chapters = data.get("chapters", [])

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    for ch in chapters:
        c_id = ch["id"]
        name_arabic = ch["name_arabic"]
        name_simple = ch["name_simple"]
        name_urdu = URDU_SURAH_NAMES[c_id - 1] if c_id <= len(URDU_SURAH_NAMES) else ch["name_arabic"]
        revelation_place = ch["revelation_place"]
        verses_count = ch["verses_count"]
        pages = ch["pages"]
        page_start = pages[0]
        page_end = pages[1]

        cursor.execute("""
            INSERT OR REPLACE INTO surahs 
            (id, name_arabic, name_simple, name_urdu, revelation_place, verses_count, page_start, page_end)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (c_id, name_arabic, name_simple, name_urdu, revelation_place, verses_count, page_start, page_end))

    conn.commit()
    conn.close()
    print(f"Successfully seeded {len(chapters)} Surahs into database!")

if __name__ == "__main__":
    seed_surahs()
