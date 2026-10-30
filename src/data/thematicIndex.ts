export interface ThematicItem {
  id: string;
  category: string;
  title_ur: string;
  title_en: string;
  description_ur: string;
  surah_id: number;
  ayah_number: number;
  verse_key: string;
  key_verses: string[];
}

export const THEMATIC_TOPICS: ThematicItem[] = [
  // 1. عقائد و ایمانیات (Creed & Faith)
  {
    id: 'tauhid-1',
    category: 'عقائد و ایمانیات',
    title_ur: 'توحیدِ باری تعالیٰ اور اخلاص',
    title_en: 'Tawheed (Oneness of Allah)',
    description_ur: 'اللہ ایک ہے، بے نیاز ہے، نہ اس کی کوئی اولاد ہے نہ وہ کسی کی اولاد ہے۔',
    surah_id: 112,
    ayah_number: 1,
    verse_key: '112:1',
    key_verses: ['112:1', '112:2', '112:3', '112:4']
  },
  {
    id: 'ayat-al-kursi',
    category: 'عقائد و ایمانیات',
    title_ur: 'آیۃ الکرسی (عظمت و حاکمیتِ الٰہی)',
    title_en: 'Ayat al-Kursi (The Throne Verse)',
    description_ur: 'اللہ وہ معبود برحق ہے جس کے سوا کوئی معبود نہیں، وہ زندہ ہے اور کائنات کو تھامنے والا ہے۔',
    surah_id: 2,
    ayah_number: 255,
    verse_key: '2:255',
    key_verses: ['2:255']
  },
  {
    id: 'asma-ul-husna',
    category: 'عقائد و ایمانیات',
    title_ur: 'اسمائے حسنیٰ و صفاتِ کمال',
    title_en: 'Beautiful Names of Allah',
    description_ur: 'وہی اللہ ہے جس کے سوا کوئی معبود نہیں، غیب اور حاضر کا جاننے والا، نہایت مہربان رحم فرمانے والا۔',
    surah_id: 59,
    ayah_number: 22,
    verse_key: '59:22',
    key_verses: ['59:22', '59:23', '59:24']
  },
  {
    id: 'risalat-khatam',
    category: 'عقائد و ایمانیات',
    title_ur: 'ختمِ نبوت و مقامِ رسالت',
    title_en: 'Finality of Prophethood',
    description_ur: 'محمد ﷺ تمہارے مَردوں میں سے کسی کے باپ نہیں مگر وہ اللہ کے رسول اور خاتم النبیین ہیں۔',
    surah_id: 33,
    ayah_number: 40,
    verse_key: '33:40',
    key_verses: ['33:40', '21:107', '48:28']
  },
  {
    id: 'akhirat-qiyamah',
    category: 'عقائد و ایمانیات',
    title_ur: 'قیامت و حشر اور روزِ جزا',
    title_en: 'Day of Judgment & Resurrection',
    description_ur: 'جب واقعہ ہونے والی (قیامت) واقع ہو جائے گی، اس کے واقع ہونے میں کوئی جھوٹ نہیں۔',
    surah_id: 56,
    ayah_number: 1,
    verse_key: '56:1',
    key_verses: ['56:1', '75:1', '81:1', '101:1']
  },
  {
    id: 'jannah',
    category: 'عقائد و ایمانیات',
    title_ur: 'جنت اور اس کی ابدی نعمتیں',
    title_en: 'Paradise (Jannah) & Eternal Bliss',
    description_ur: 'اور جو شخص اپنے رب کے سامنے کھڑے ہونے سے ڈرا اس کے لیے دو باغ ہیں۔',
    surah_id: 55,
    ayah_number: 46,
    verse_key: '55:46',
    key_verses: ['55:46', '56:11', '76:12']
  },

  // 2. عبادات و ارکانِ دین (Worship & Pillars)
  {
    id: 'salah',
    category: 'عبادات و ارکان',
    title_ur: 'نماز کی اہمیت اور پابندی',
    title_en: 'Establishment of Regular Prayer',
    description_ur: 'نماز قائم کرو اور زکوٰۃ ادا کرو اور رکوع کرنے والوں کے ساتھ رکوع کرو۔ بے شک نماز بے حیائی اور برائی سے روکتی ہے۔',
    surah_id: 2,
    ayah_number: 43,
    verse_key: '2:43',
    key_verses: ['2:43', '2:238', '29:45', '17:78']
  },
  {
    id: 'infaq-zakah',
    category: 'عبادات و ارکان',
    title_ur: 'انفاق فی سبیل اللہ اور زکوٰۃ',
    title_en: 'Charity, Zakat & Infaq',
    description_ur: 'جو لوگ اپنا مال اللہ کے راستے میں خرچ کرتے ہیں ان کی مثال اس دانے جیسی ہے جس سے سات بالیاں اگیں۔',
    surah_id: 2,
    ayah_number: 261,
    verse_key: '2:261',
    key_verses: ['2:261', '9:60', '2:274']
  },
  {
    id: 'fasting-ramadan',
    category: 'عبادات و ارکان',
    title_ur: 'روزہ اور ماہِ رمضان المبارک',
    title_en: 'Fasting in Ramadan',
    description_ur: 'اے ایمان والو! تم پر روزے فرض کیے گئے جیسے تم سے اگلوں پر فرض ہوئے تھے تاکہ تم پرہیزگار بنو۔',
    surah_id: 2,
    ayah_number: 183,
    verse_key: '2:183',
    key_verses: ['2:183', '2:184', '2:185']
  },
  {
    id: 'hajj-umrah',
    category: 'عبادات و ارکان',
    title_ur: 'حج و عمرہ اور شعائر اللہ',
    title_en: 'Pilgrimage (Hajj & Umrah)',
    description_ur: 'اور اللہ کے لیے حج اور عمرہ پورا کرو، اور لوگوں میں حج کا اعلان کر دو۔',
    surah_id: 2,
    ayah_number: 196,
    verse_key: '2:196',
    key_verses: ['2:196', '22:27', '3:97']
  },
  {
    id: 'dua-istighfar',
    category: 'عبادات و ارکان',
    title_ur: 'دعا، مناجات اور استغفار',
    title_en: 'Supplication & Repentance',
    description_ur: 'اور جب میرے بندے آپ سے میرے متعلق پوچھیں تو میں قریب ہوں، پکارنے والے کی دعا قبول کرتا ہوں۔',
    surah_id: 2,
    ayah_number: 186,
    verse_key: '2:186',
    key_verses: ['2:186', '40:60', '71:10']
  },

  // 3. اخلاقیات و تزکیہ (Ethics & Character)
  {
    id: 'sabr-istiqamat',
    category: 'اخلاقیات و تزکیہ',
    title_ur: 'صبر، استقامت اور شکر',
    title_en: 'Patience, Perseverance & Gratitude',
    description_ur: 'اے ایمان والو! صبر اور نماز سے مدد چاہو، یقیناً اللہ صبر کرنے والوں کے ساتھ ہے۔',
    surah_id: 2,
    ayah_number: 153,
    verse_key: '2:153',
    key_verses: ['2:153', '3:200', '103:1', '14:7']
  },
  {
    id: 'taqwa',
    category: 'اخلاقیات و تزکیہ',
    title_ur: 'تقویٰ، اخلاص اور پرہیزگاری',
    title_en: 'Taqwa (God-Consciousness)',
    description_ur: 'اللہ کے نزدیک تم میں سب سے زیادہ معزز وہ ہے جو تم میں سب سے زیادہ پرہیزگار ہے۔',
    surah_id: 49,
    ayah_number: 13,
    verse_key: '49:13',
    key_verses: ['49:13', '3:102', '2:197']
  },
  {
    id: 'parents-rights',
    category: 'اخلاقیات و تزکیہ',
    title_ur: 'والدین اور صلہ رحمی کے حقوق',
    title_en: 'Honoring Parents & Kinship',
    description_ur: 'اور تیرے رب نے حکم دیا کہ اس کے سوا کسی کی عبادت نہ کرو اور ماں باپ کے ساتھ حسنِ سلوک کرو۔',
    surah_id: 17,
    ayah_number: 23,
    verse_key: '17:23',
    key_verses: ['17:23', '31:14', '46:15']
  },
  {
    id: 'adl-insaf',
    category: 'اخلاقیات و تزکیہ',
    title_ur: 'عدل، انصاف اور سچی گواہی',
    title_en: 'Justice, Equity & Truthful Testimony',
    description_ur: 'اے ایمان والو! انصاف پر قائم رہنے والے اور اللہ کے واسطے سچی گواہی دینے والے بنو۔',
    surah_id: 4,
    ayah_number: 135,
    verse_key: '4:135',
    key_verses: ['4:135', '5:8', '16:90']
  },

  // 4. قصص الانبیاء (Stories of the Prophets)
  {
    id: 'qisas-adam',
    category: 'قصص الانبیاء',
    title_ur: 'سیدنا آدمؑ کی تخلیق اور خلافت',
    title_en: 'Prophet Adam & Human Creation',
    description_ur: 'اور جب تیرے رب نے فرشتوں سے کہا کہ میں زمین میں ایک خلیفہ بنانے والا ہوں۔',
    surah_id: 2,
    ayah_number: 30,
    verse_key: '2:30',
    key_verses: ['2:30', '7:11', '20:115']
  },
  {
    id: 'qisas-ibrahim',
    category: 'قصص الانبیاء',
    title_ur: 'سیدنا ابراہیمؑ کی آزمائشیں و قربانی',
    title_en: 'Prophet Ibrahim (The Friend of Allah)',
    description_ur: 'اور جب ابراہیم کو اس کے رب نے چند باتوں میں آزمایا اور اس نے وہ پوری کر دکھائیں۔',
    surah_id: 2,
    ayah_number: 124,
    verse_key: '2:124',
    key_verses: ['2:124', '14:35', '21:51', '37:102']
  },
  {
    id: 'qisas-yusuf',
    category: 'قصص الانبیاء',
    title_ur: 'سیدنا یوسفؑ کا واقعہ (احسن القصص)',
    title_en: 'Prophet Yusuf (Best of Stories)',
    description_ur: 'ہم آپ کے سامنے ایک بہترین قصہ بیان کرتے ہیں جو ہم نے اس قرآن کی صورت میں وحی کیا۔',
    surah_id: 12,
    ayah_number: 3,
    verse_key: '12:3',
    key_verses: ['12:3', '12:4', '12:101']
  },
  {
    id: 'qisas-musa',
    category: 'قصص الانبیاء',
    title_ur: 'سیدنا موسیٰؑ اور فرعون کا انجام',
    title_en: 'Prophet Musa & Pharaoh',
    description_ur: 'ہم موسیٰ اور فرعون کا سچا واقعہ ان لوگوں کے سامنے پڑھتے ہیں جو ایمان لاتے ہیں۔',
    surah_id: 28,
    ayah_number: 3,
    verse_key: '28:3',
    key_verses: ['28:3', '20:9', '26:10']
  },
  {
    id: 'qisas-isa',
    category: 'قصص الانبیاء',
    title_ur: 'سیدنا عیسیٰؑ اور سیدہ مریمؑ',
    title_en: 'Prophet Isa & Maryam',
    description_ur: 'اور یاد کرو جب فرشتوں نے کہا: اے مریم! بے شک اللہ نے تجھے برگزیدہ کیا اور پاکیزہ بنایا۔',
    surah_id: 3,
    ayah_number: 42,
    verse_key: '3:42',
    key_verses: ['3:42', '19:16', '4:171']
  },

  // 5. احکام و معاملات (Social & Legal Ordinances)
  {
    id: 'riba-trade',
    category: 'احکام و معاملات',
    title_ur: 'حرمتِ سود اور حلال تجارت',
    title_en: 'Prohibition of Riba (Usury) & Trade',
    description_ur: 'اللہ نے تجارت کو حلال کیا ہے اور سود کو حرام ٹھہرایا ہے۔',
    surah_id: 2,
    ayah_number: 275,
    verse_key: '2:275',
    key_verses: ['2:275', '2:278', '3:130']
  },
  {
    id: 'family-marriage',
    category: 'احکام و معاملات',
    title_ur: 'نکاح، طلاق اور عائلی زندگی',
    title_en: 'Family Law, Marriage & Divorce',
    description_ur: 'اور عورتوں کے ساتھ بھلے طریقے سے زندگی گزارو، اگر وہ تمہیں ناپسند بھی ہوں تو ہو سکتا ہے تم کسی چیز کو ناپسند کرو اور اللہ اس میں بہت بھلائی رکھ دے۔',
    surah_id: 4,
    ayah_number: 19,
    verse_key: '4:19',
    key_verses: ['4:19', '2:228', '65:1']
  },
  {
    id: 'sanctity-life',
    category: 'احکام و معاملات',
    title_ur: 'حرمتِ جان اور انسانیت کا وقار',
    title_en: 'Sanctity of Human Life',
    description_ur: 'جس نے کسی انسان کو بغیر کسی کے قتل یا زمین میں فساد پھیلانے کے بدلے قتل کیا گویا اس نے تمام انسانوں کو قتل کیا۔',
    surah_id: 5,
    ayah_number: 32,
    verse_key: '5:32',
    key_verses: ['5:32', '17:33', '4:93']
  }
];
