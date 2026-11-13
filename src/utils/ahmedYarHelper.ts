/**
 * Intelligent Parser & Sanitizer for Professor Hafiz Ahmed Yar's
 * "ترکیب و اعرابِ قرآن کی روشنی میں ترجمۂ قرآن کی لغوی اور نحوی بنیادیں"
 */

export interface AhmedYarWordItem {
  id: string;
  word: string;
  indexCode?: string;
  sectionType?: string;
  contentHtml: string;
}

export interface ParsedAhmedYarData {
  title: string;
  matnVerse: string;
  words: AhmedYarWordItem[];
  footnotes: string[];
  fallbackHtml: string;
}

/**
 * Clean legacy MS Word / InPage web artifacts from the HTML
 */
export function sanitizeRawAhmedYarHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  let html = rawHtml;

  // 1. Strip harmful inline styles that ruin dark mode or hardcode fonts
  html = html.replace(/\s*style="[^"]*"/gi, '');

  // 2. Remove empty Word bookmark anchors like <a name="_Toc..."></a>
  html = html.replace(/<a\s+name="[^"]*">\s*<\/a>/gi, '');

  // 3. Normalize non-breaking spaces
  html = html.replace(/&nbsp;/gi, ' ');

  // 4. Clean empty paragraphs
  html = html.replace(/<p\s*>\s*(?:<br\s*\/?>|\s)*<\/p>/gi, '');

  // 5. Remove excessive whitespace within tags
  html = html.replace(/<p\s*>\s+/gi, '<p>');

  return html;
}

/**
 * Enhance inline grammatical terms with responsive badges
 */
export function enhanceAhmedYarGrammar(textHtml: string): string {
  let res = textHtml;

  // Highlight Root (مادہ) - supporting both raw text and <span class="arabic-marker">
  res = res.replace(
    /(مادہ\s*[’’"']?\s*)(<span class="arabic-marker">[^<]+<\/span>|[ء-ي\u0600-\u06FF\s]{1,16})([’’"']?)/gi,
    '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold text-xs border border-amber-500/25 my-0.5"><span class="opacity-75">مادہ:</span> <b class="font-mono text-amber-900 dark:text-amber-200">$2</b></span>'
  );

  // Highlight Wazn / Measure (وزن)
  res = res.replace(
    /(وزن\s*[’’"']?\s*)(<span class="arabic-marker">[^<]+<\/span>|[ء-ي\u0600-\u06FF\sَُِّْٰٓ]{1,20})([’’"']?)/gi,
    '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 font-bold text-xs border border-indigo-500/25 my-0.5"><span class="opacity-75">وزن:</span> <b class="font-mono text-indigo-900 dark:text-indigo-200">$2</b></span>'
  );

  // Highlight Bab / Verb Form (باب)
  res = res.replace(
    /(باب\s+)(<span class="arabic-marker">[^<]+<\/span>|[ء-ي\u0600-\u06FF\sَُِّْٰٓ]{2,20})(?=\s|،|۔|سے)/gi,
    '<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold text-xs border border-emerald-500/25 my-0.5"><span class="opacity-75">باب:</span> $2</span>'
  );

  // Highlight Core Grammatical Terms
  const gramTerms = [
    'اسم اشارہ بعید', 'اسم اشارہ قریب', 'اسم اشارہ', 'اسم موصول',
    'حرف الجر', 'حروف جارہ', 'فعل ماضی مجہول', 'فعل ماضی معروف', 'فعل ماضی',
    'فعل مضارع مجہول', 'فعل مضارع معروف', 'فعل مضارع', 'فعل امر', 'فعل نہی',
    'ثلاثی مجرد', 'ثلاثی مزید فیہ', 'مبتدا', 'خبر', 'فاعل', 'مفعول بہ', 'مفعول مطلق',
    'مفعول لہ', 'مفعول', 'مضاف الیہ', 'مضاف', 'صلہ', 'موصوف', 'صفت', 'کافِ خطاب',
    'حرف مشبہ بالفعل'
  ];

  for (const term of gramTerms) {
    const re = new RegExp(`(?<![ء-ي\u0600-\u06FF])(${term})(?![ء-ي\u0600-\u06FF])`, 'g');
    res = res.replace(
      re,
      '<span class="px-1.5 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300/60 dark:border-slate-700/60">$1</span>'
    );
  }

  // Format Arabic markers nicely
  res = res.replace(
    /<span class="arabic-marker">([^<]+)<\/span>/gi,
    '<span class="font-arabic text-base text-emerald-900 dark:text-emerald-300 font-bold px-1">$1</span>'
  );

  // Format Quran markers
  res = res.replace(
    /<span class="quran-marker">([^<]+)<\/span>/gi,
    '<span class="font-qcf text-lg text-emerald-800 dark:text-emerald-300 font-bold px-1">$1</span>'
  );

  // Format English markers
  res = res.replace(
    /<span class="english-marker">([^<]+)<\/span>/gi,
    '<span class="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">$1</span>'
  );

  // Format cross-reference links
  res = res.replace(
    /<a\s+href="([^"]+)"\s*target="_blank"[^>]*>([^<]+)<\/a>/gi,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:underline text-xs font-mono font-bold">$2 ↗</a>'
  );

  return res;
}

/**
 * Parse Professor Ahmed Yar's HTML into structured Word Cards
 */
export function parseAhmedYarContent(rawHtml: string): ParsedAhmedYarData {
  const sanitized = sanitizeRawAhmedYarHtml(rawHtml);

  if (typeof window === 'undefined') {
    return {
      title: '',
      matnVerse: '',
      words: [],
      footnotes: [],
      fallbackHtml: sanitized
    };
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(sanitized, 'text/html');

  let title = '';
  let matnVerse = '';
  const words: AhmedYarWordItem[] = [];
  const footnotes: string[] = [];

  const paragraphs = Array.from(doc.querySelectorAll('p, ul, li'));

  // 1. Extract Title & Sacred Matn Verse from the early paragraphs
  for (let i = 0; i < Math.min(paragraphs.length, 6); i++) {
    const p = paragraphs[i];
    const text = p.textContent?.trim() || '';
    if (!title && (text.includes('سورۃ') || text.includes('سُوْرَۃُ')) && (text.includes('آیت') || text.includes('آیت'))) {
      title = text;
    }
    const qm = p.querySelector('.quran-marker');
    if (!matnVerse && qm) {
      const qmText = qm.textContent?.trim() || '';
      if (qmText.length > 15) {
        // Strip any leading index number like "۲:۱      "
        matnVerse = qmText.replace(/^[۱-۹\d:() ]+\s*/, '');
      }
    }
  }

  // 2. Process paragraphs into Word Cards, Section Headers, and Footnotes
  let currentWordItem: AhmedYarWordItem | null = null;
  let currentSection = '';
  let wordCounter = 1;
  let isFootnoteSection = false;

  const excludedCandidates = [
    'اللغۃ', 'الاعراب', 'الترکیب', 'تسمیہ', 'بعد ہجرت', 
    'پہلا قول', 'دوسرا قول', 'تیسرا قول'
  ];

  for (const el of paragraphs) {
    const text = el.textContent?.trim() || '';
    if (!text) continue;

    // Skip the title and the main verse matn
    if (title && text === title) continue;
    if (matnVerse && text.includes(matnVerse)) continue;

    // Check for footnote section divider (e.g. "________" or "--------")
    if (/^[_\-]{4,}/.test(text)) {
      isFootnoteSection = true;
      continue;
    }

    // Footnotes collection
    if (isFootnoteSection || /^\[[۱-۹\d]+\]/.test(text)) {
      footnotes.push(enhanceAhmedYarGrammar(el.innerHTML));
      continue;
    }

    // Check for Section Header (اللغۃ, الترکیب, الاعراب)
    if (text.includes('اللغۃ')) {
      currentSection = 'اللغۃ (لغت و صرف)';
    } else if (text.includes('الترکیب')) {
      currentSection = 'الترکیب (نحوی ترکیب)';
    } else if (text.includes('الاعراب')) {
      currentSection = 'الاعراب (اعرابِ کلمات)';
    }

    // Pure section header line without word content
    const isPureSectionHeader = /^(?:[۱-۹\d:() ]+)?\s*(?:اللغۃ|الاعراب|الترکیب)\s*$/.test(text);
    if (isPureSectionHeader) {
      continue;
    }

    // Check if this paragraph starts a new analyzed word:
    // Pattern: optional index at start, followed by [WORD] or (WORD) or )WORD)
    const bracketMatch = text.match(/^(?:([۱-۹\d:() ]+)\s*)?(?:\[|\(|\))\s*([^\]()<>\d\r\n]{1,65})\s*(?:\]|\))/);

    if (bracketMatch) {
      const candidateWord = bracketMatch[2].trim();
      const isExcluded = excludedCandidates.some(ex => candidateWord.includes(ex));

      if (!isExcluded && candidateWord.length >= 1) {
        const detectedIndex = bracketMatch[1]?.trim() || '';

        currentWordItem = {
          id: `ay_word_${wordCounter++}`,
          word: candidateWord,
          indexCode: detectedIndex,
          sectionType: currentSection,
          contentHtml: `<p class="mb-3">${enhanceAhmedYarGrammar(el.innerHTML)}</p>`
        };
        words.push(currentWordItem);
        continue;
      }
    }

    // If already inside an active word card, append this paragraph
    if (currentWordItem) {
      currentWordItem.contentHtml += `<p class="mb-3">${enhanceAhmedYarGrammar(el.innerHTML)}</p>`;
    }
  }

  return {
    title,
    matnVerse,
    words,
    footnotes,
    fallbackHtml: enhanceAhmedYarGrammar(sanitized)
  };
}
