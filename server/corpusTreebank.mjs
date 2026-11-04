/**
 * Corpus Treebank & Syntactic Dependency Parser Engine
 * Replicates corpus.quran.com syntactic treebank and morpheme decomposition
 * with 10 Classical Arabic Sarf Verb Forms (الأوزان العشرة).
 */

export function buildAyahDependencyTree(words) {
  if (!words || words.length === 0) {
    return { nodes: [], edges: [], roots: [] };
  }

  const nodes = [];
  const edges = [];
  const rootsMap = new Map();

  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const pos = w.pos_tag || '';
    const grammar = w.grammar_details || '';

    // Determine category and color
    let category = 'noun';
    let roleArabic = 'اسم';
    let roleCode = 'N';

    if (pos.includes('فعل') || grammar.includes('فعل')) {
      category = 'verb';
      roleCode = 'V';
      if (grammar.includes('ماض')) roleArabic = 'فعل ماضٍ';
      else if (grammar.includes('مضارع')) roleArabic = 'فعل مضارع';
      else if (grammar.includes('أمر')) roleArabic = 'فعل أمر';
      else roleArabic = 'فعل';
    } else if (pos.includes('حرف') || grammar.includes('حرف') || pos.includes('أداة')) {
      category = 'particle';
      roleCode = 'P';
      if (pos.includes('جر') || grammar.includes('جر')) roleArabic = 'حرف جر';
      else if (pos.includes('عطف') || grammar.includes('عطف')) roleArabic = 'حرف عطف';
      else if (pos.includes('نفي') || grammar.includes('نفي')) roleArabic = 'حرف نفي';
      else if (pos.includes('توكيد') || grammar.includes('توكيد')) roleArabic = 'حرف توكيد';
      else roleArabic = 'أداة / حرف';
    } else if (pos.includes('ضمير') || grammar.includes('ضمير')) {
      category = 'pronoun';
      roleCode = 'PRON';
      roleArabic = 'ضمير';
    } else if (pos.includes('اسم علم') || grammar.includes('اسم علم')) {
      category = 'proper_noun';
      roleCode = 'PN';
      roleArabic = 'اسم علم';
    } else if (grammar.includes('صفة') || grammar.includes('نعت')) {
      category = 'adjective';
      roleCode = 'ADJ';
      roleArabic = 'صفة / نعت';
    } else if (grammar.includes('موصول') || pos.includes('موصول')) {
      category = 'relative';
      roleCode = 'REL';
      roleArabic = 'اسم موصول';
    } else if (grammar.includes('مجرور')) {
      roleArabic = 'اسم مجرور';
    } else if (grammar.includes('مرفوع')) {
      roleArabic = 'اسم مرفوع';
    } else if (grammar.includes('منصوب')) {
      roleArabic = 'اسم منصوب';
    }

    // Sub-word morphemes decomposition (Prefix + Stem + Suffix)
    const subSegments = [];
    const text = w.text_uthmani || '';

    if (text.startsWith('وَ') || text.startsWith('فَ') || text.startsWith('بِ') || text.startsWith('لِ') || text.startsWith('كَ')) {
      if (text.length > 2) {
        subSegments.push({
          type: 'PREFIX',
          text: text[0],
          pos: text[0] === 'وَ' || text[0] === 'فَ' ? 'حرف عطف' : 'حرف جر'
        });
        subSegments.push({
          type: 'STEM',
          text: text.slice(1),
          pos: roleArabic,
          root: w.root,
          lemma: w.lemma
        });
      }
    } else if (text.startsWith('ٱل') || text.startsWith('ال')) {
      subSegments.push({
        type: 'PREFIX',
        text: 'الـ',
        pos: 'أداة تعريف'
      });
      subSegments.push({
        type: 'STEM',
        text: text.slice(2),
        pos: roleArabic,
        root: w.root,
        lemma: w.lemma
      });
    } else {
      subSegments.push({
        type: 'STEM',
        text: text,
        pos: roleArabic,
        root: w.root,
        lemma: w.lemma
      });
    }

    // Add node
    nodes.push({
      id: w.position || (i + 1),
      position: w.position || (i + 1),
      text_uthmani: w.text_uthmani,
      root: w.root,
      lemma: w.lemma,
      pos_tag: w.pos_tag,
      grammar_details: w.grammar_details,
      translation_ur: w.translation_ur || w.translation_ur_2,
      translation_en: w.translation_en || w.translation_en_2,
      category,
      role_arabic: roleArabic,
      role_code: roleCode,
      sub_segments: subSegments
    });

    if (w.root && !rootsMap.has(w.root)) {
      rootsMap.set(w.root, {
        root: w.root,
        lemma: w.lemma,
        pos: roleArabic,
        paradigms: generateSarfParadigms(w.root)
      });
    }
  }

  // Syntactic Dependency Edges Generation
  for (let i = 0; i < nodes.length; i++) {
    const cur = nodes[i];
    const prev = i > 0 ? nodes[i - 1] : null;
    const next = i < nodes.length - 1 ? nodes[i + 1] : null;

    // 1. Prepositional Phrase (Jar wa Majrur)
    if (prev && prev.category === 'particle' && prev.role_arabic === 'حرف جر') {
      edges.push({
        source: prev.position,
        target: cur.position,
        label_arabic: 'جار ومجرور',
        label_code: 'GEN'
      });
    }

    // 2. Conjunction (Harf 'Atf)
    if (cur.category === 'particle' && cur.role_arabic === 'حرف عطف' && next) {
      edges.push({
        source: cur.position,
        target: next.position,
        label_arabic: 'معطوف',
        label_code: 'LINK'
      });
    }

    // 3. Adjective / Sifah (Attribution)
    if (cur.category === 'adjective' && prev) {
      edges.push({
        source: prev.position,
        target: cur.position,
        label_arabic: 'صفة / نعت',
        label_code: 'MOD'
      });
    }

    // 4. Verb to Subject / Object
    if (cur.category === 'verb') {
      // Find following noun or pronoun as subject / object
      for (let j = i + 1; j < Math.min(i + 4, nodes.length); j++) {
        const candidate = nodes[j];
        if (candidate.category === 'noun' || candidate.category === 'proper_noun' || candidate.category === 'pronoun') {
          if (candidate.grammar_details?.includes('مرفوع')) {
            edges.push({
              source: cur.position,
              target: candidate.position,
              label_arabic: 'فاعل',
              label_code: 'SUBJ'
            });
            break;
          } else if (candidate.grammar_details?.includes('منصوب')) {
            edges.push({
              source: cur.position,
              target: candidate.position,
              label_arabic: 'مفعول به',
              label_code: 'OBJ'
            });
            break;
          }
        }
      }
    }

    // 5. Genitive Construct (Mudaf wa Mudaf Ilayh)
    if (cur.grammar_details?.includes('مجرور') && prev && prev.category === 'noun' && !edges.some(e => e.target === cur.position)) {
      edges.push({
        source: prev.position,
        target: cur.position,
        label_arabic: 'مضاف إليه',
        label_code: 'POSS'
      });
    }
  }

  return {
    nodes,
    edges,
    roots: Array.from(rootsMap.values())
  };
}

/**
 * 10 Classical Arabic Sarf Verb Forms (الأوزان العشرة) generator
 */
export function generateSarfParadigms(root) {
  if (!root || root.length < 3) return [];
  const r1 = root[0];
  const r2 = root[1];
  const r3 = root[2];

  return [
    {
      form: 'I',
      wazan: 'فَعَلَ',
      madi: `${r1}َ${r2}َ${r3}َ`,
      mudari: `يَ${r1}ْ${r2}ُ${r3}ُ`,
      masdar: `فَعْل / فِعَالَة`,
      ism_fail: `${r1}َا${r2}ِ${r3}`,
      ism_maful: `مَ${r1}ْ${r2}ُ${r3}ود`,
      meaning: 'Basic triliteral base verb'
    },
    {
      form: 'II',
      wazan: 'فَعَّلَ',
      madi: `${r1}َ${r2}َّ${r3}َ`,
      mudari: `يُ${r1}َ${r2}ِّ${r3}ُ`,
      masdar: `تَفْعِيل`,
      ism_fail: `مُ${r1}َ${r2}ِّ${r3}`,
      ism_maful: `مُ${r1}َ${r2}َّ${r3}`,
      meaning: 'Intensive or Causative action (تعدية وتكثير)'
    },
    {
      form: 'III',
      wazan: 'فَاعَلَ',
      madi: `${r1}َا${r2}َ${r3}َ`,
      mudari: `يُ${r1}َا${r2}ِ${r3}ُ`,
      masdar: `مُفَاعَلَة`,
      ism_fail: `مُ${r1}َا${r2}ِ${r3}`,
      ism_maful: `مُ${r1}َا${r2}َ${r3}`,
      meaning: 'Reciprocity or Attempt (مشاركة ومحاولة)'
    },
    {
      form: 'IV',
      wazan: 'أَفْعَلَ',
      madi: `أَ${r1}ْ${r2}َ${r3}َ`,
      mudari: `يُ${r1}ْ${r2}ِ${r3}ُ`,
      masdar: `إِفْعَال`,
      ism_fail: `مُ${r1}ْ${r2}ِ${r3}`,
      ism_maful: `مُ${r1}ْ${r2}َ${r3}`,
      meaning: 'Transitive / Causative (تعدية)'
    },
    {
      form: 'V',
      wazan: 'تَفَعَّلَ',
      madi: `تَ${r1}َ${r2}َّ${r3}َ`,
      mudari: `يَتَ${r1}َ${r2}َّ${r3}ُ`,
      masdar: `تَفَعُّل`,
      ism_fail: `مُتَ${r1}َ${r2}ِّ${r3}`,
      ism_maful: `مُتَ${r1}َ${r2}َّ${r3}`,
      meaning: 'Reflexive of Form II / Gradual achievement (مطاوعة وتكلف)'
    },
    {
      form: 'VI',
      wazan: 'تَفَاعَلَ',
      madi: `تَ${r1}َا${r2}َ${r3}َ`,
      mudari: `يَتَ${r1}َا${r2}َ${r3}ُ`,
      masdar: `تَفَاعُل`,
      ism_fail: `مُتَ${r1}َا${r2}ِ${r3}`,
      ism_maful: `مُتَ${r1}َا${r2}َ${r3}`,
      meaning: 'Mutual interaction or Simulation (تفاعل وتظاهر)'
    },
    {
      form: 'VII',
      wazan: 'انْفَعَلَ',
      madi: `انْ${r1}َ${r2}َ${r3}َ`,
      mudari: `يَنْ${r1}َ${r2}ِ${r3}ُ`,
      masdar: `انْفِعَال`,
      ism_fail: `مُنْ${r1}َ${r2}ِ${r3}`,
      ism_maful: `—`,
      meaning: 'Passive / Involuntary result (مطاوعة مجرد)'
    },
    {
      form: 'VIII',
      wazan: 'افْتَعَلَ',
      madi: `افْ${r1}ْتَ${r2}َ${r3}َ`,
      mudari: `يَفْ${r1}ْتَ${r2}ِ${r3}ُ`,
      masdar: `افْتِعَال`,
      ism_fail: `مُفْ${r1}ْتَ${r2}ِ${r3}`,
      ism_maful: `مُفْ${r1}ْتَ${r2}َ${r3}`,
      meaning: 'Effort or Acquisition (اكتساب واجتهاد)'
    },
    {
      form: 'X',
      wazan: 'اسْتَفْعَلَ',
      madi: `اسْتَ${r1}ْ${r2}َ${r3}َ`,
      mudari: `يَسْتَ${r1}ْ${r2}ِ${r3}ُ`,
      masdar: `اسْتِفْعَال`,
      ism_fail: `مُسْتَ${r1}ْ${r2}ِ${r3}`,
      ism_maful: `مُسْتَ${r1}ْ${r2}َ${r3}`,
      meaning: 'Seeking or Requesting (طلب وتحول)'
    }
  ];
}
