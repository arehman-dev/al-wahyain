import { ShortcutDefinition, CustomShortcutsMap, NavArrowMode } from '../types/shortcuts';

export const SHORTCUT_DEFINITIONS: ShortcutDefinition[] = [
  {
    id: 'nav_next_ayah',
    nameUrdu: 'اگلی آیت',
    nameEn: 'Next Ayah',
    category: 'nav',
    defaultKey: 'ArrowLeft', // Under RTL default
    descriptionUrdu: 'قرآنی متن کے رخ پر اگلی آیت کی جانب بڑھیے'
  },
  {
    id: 'nav_prev_ayah',
    nameUrdu: 'پچھلی آیت',
    nameEn: 'Previous Ayah',
    category: 'nav',
    defaultKey: 'ArrowRight', // Under RTL default
    descriptionUrdu: 'قرآنی متن کے رخ پر پچھلی آیت کی جانب واپس آئیے'
  },
  {
    id: 'nav_next_surah',
    nameUrdu: 'اگلی سورت',
    nameEn: 'Next Surah',
    category: 'nav',
    defaultKey: 'Shift+ArrowLeft', // Under RTL default
    descriptionUrdu: 'فہرست میں اگلی سورت کے آغاز پر جائیے'
  },
  {
    id: 'nav_prev_surah',
    nameUrdu: 'پچھلی سورت',
    nameEn: 'Previous Surah',
    category: 'nav',
    defaultKey: 'Shift+ArrowRight', // Under RTL default
    descriptionUrdu: 'فہرست میں پچھلی سورت کے آغاز پر جائیے'
  },
  {
    id: 'audio_play_pause',
    nameUrdu: 'تلاوت چلائیں / روکیں',
    nameEn: 'Play / Pause Recitation',
    category: 'audio',
    defaultKey: 'Space',
    descriptionUrdu: 'قاری کی تلاوت شروع یا موقوف کیجیے'
  },
  {
    id: 'search_omnibar',
    nameUrdu: 'قرآن و تفاسیر میں تلاش',
    nameEn: 'Global Search (Omnibar)',
    category: 'study',
    defaultKey: 'Ctrl+k',
    descriptionUrdu: 'کسی بھی لفظ، آیت یا تفسیری بحث کو تلاش کیجیے'
  },
  {
    id: 'study_bookmark',
    nameUrdu: 'آیت محفوظ کریں',
    nameEn: 'Toggle Bookmark',
    category: 'study',
    defaultKey: 'b',
    descriptionUrdu: 'زیرِ مطالعہ آیت کو بُک مارک لسٹ میں شامل یا خارج کیجیے'
  },
  {
    id: 'study_note',
    nameUrdu: 'تفسیری نوٹ لکھیں',
    nameEn: 'Open Notes Drawer',
    category: 'study',
    defaultKey: 'n',
    descriptionUrdu: 'آیت پر اپنا ذاتی تفسیری یا علمی نوٹ تحریر کیجیے'
  },
  {
    id: 'view_zen',
    nameUrdu: 'زین فوکس موڈ',
    nameEn: 'Toggle Zen Mode',
    category: 'study',
    defaultKey: 'z',
    descriptionUrdu: 'بغیر کسی خلل کے مکمل اسکرین پر مطالعہ کیجیے'
  },
  {
    id: 'nav_next_page',
    nameUrdu: 'مصحف کا اگلا صفحہ',
    nameEn: 'Next Mushaf Page',
    category: 'nav',
    defaultKey: 'PageDown',
    descriptionUrdu: 'مصحفِ مدینہ کے اگلے صفحے پر جائیے'
  },
  {
    id: 'nav_prev_page',
    nameUrdu: 'مصحف کا پچھلا صفحہ',
    nameEn: 'Previous Mushaf Page',
    category: 'nav',
    defaultKey: 'PageUp',
    descriptionUrdu: 'مصحفِ مدینہ کے پچھلے صفحے پر جائیے'
  },
  {
    id: 'help_shortcuts',
    nameUrdu: 'شارٹ کٹس جدول',
    nameEn: 'Show Shortcuts Table',
    category: 'study',
    defaultKey: '?',
    descriptionUrdu: 'کی بورڈ شارٹ کٹس کا رہنما ڈائیلاگ دیکھیے'
  },
  {
    id: 'mode_mushaf',
    nameUrdu: 'مصحف موڈ (1)',
    nameEn: 'Quran Mushaf Mode',
    category: 'modes',
    defaultKey: '1',
    descriptionUrdu: 'مصحفِ مدینہ کے اصلی اوراق پر جائیں'
  },
  {
    id: 'mode_translation',
    nameUrdu: 'ترجمہ موڈ (2)',
    nameEn: 'Translation Mode',
    category: 'modes',
    defaultKey: '2',
    descriptionUrdu: 'تقابلی اور لفظی تراجم کے موڈ پر جائیں'
  },
  {
    id: 'mode_sarf',
    nameUrdu: 'صرف موڈ (3)',
    nameEn: 'Morphology Mode',
    category: 'modes',
    defaultKey: '3',
    descriptionUrdu: 'صرفی ابواب، اوزان اور لغوی تجزیہ پر جائیں'
  },
  {
    id: 'mode_tafsir',
    nameUrdu: 'تفسیر موڈ (4)',
    nameEn: 'Tafsir Mode',
    category: 'modes',
    defaultKey: '4',
    descriptionUrdu: 'معتمد تفاسیر اور شروح کے موڈ پر جائیں'
  }
];

const NAV_ARROW_STORAGE_KEY = 'al_wahyain_nav_arrow_mode';
const CUSTOM_SHORTCUTS_STORAGE_KEY = 'al_wahyain_custom_shortcuts';

export const getStoredNavArrowMode = (): NavArrowMode => {
  if (typeof window === 'undefined') return 'rtl';
  const val = localStorage.getItem(NAV_ARROW_STORAGE_KEY);
  return val === 'ltr' ? 'ltr' : 'rtl';
};

export const setStoredNavArrowMode = (mode: NavArrowMode): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NAV_ARROW_STORAGE_KEY, mode);
};

export const getStoredCustomShortcuts = (): CustomShortcutsMap => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CUSTOM_SHORTCUTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as CustomShortcutsMap;
  } catch {
    return {};
  }
};

export const setStoredCustomShortcuts = (shortcuts: CustomShortcutsMap): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CUSTOM_SHORTCUTS_STORAGE_KEY, JSON.stringify(shortcuts));
};

export const getEffectiveShortcut = (
  shortcutId: string,
  customShortcuts: CustomShortcutsMap,
  navArrowMode: NavArrowMode
): string => {
  // If user explicitly customized this key, respect their customization
  if (customShortcuts[shortcutId]) {
    return customShortcuts[shortcutId];
  }

  // Handle dynamic arrow navigation defaults
  if (shortcutId === 'nav_next_ayah') {
    return navArrowMode === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
  }
  if (shortcutId === 'nav_prev_ayah') {
    return navArrowMode === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
  }
  if (shortcutId === 'nav_next_surah') {
    return navArrowMode === 'rtl' ? 'Shift+ArrowLeft' : 'Shift+ArrowRight';
  }
  if (shortcutId === 'nav_prev_surah') {
    return navArrowMode === 'rtl' ? 'Shift+ArrowRight' : 'Shift+ArrowLeft';
  }

  const def = SHORTCUT_DEFINITIONS.find(d => d.id === shortcutId);
  return def ? def.defaultKey : '';
};

export const formatKeyForDisplay = (keyString: string): string => {
  if (!keyString) return 'مقرر نہیں';

  const parts = keyString.split('+');
  const formattedParts = parts.map(part => {
    const p = part.trim();
    if (p === 'ArrowLeft') return '← (Left Arrow)';
    if (p === 'ArrowRight') return '→ (Right Arrow)';
    if (p === 'ArrowUp') return '↑';
    if (p === 'ArrowDown') return '↓';
    if (p === 'Space' || p === ' ') return 'Space';
    if (p === 'PageDown') return 'PageDown';
    if (p === 'PageUp') return 'PageUp';
    if (p === 'Escape' || p === 'Esc') return 'Esc';
    if (p === 'Control' || p === 'Ctrl') return 'Ctrl';
    if (p === 'Meta' || p === 'Cmd') return 'Cmd';
    if (p === 'Alt') return 'Alt';
    if (p === 'Shift') return 'Shift';
    return p.toUpperCase();
  });

  return formattedParts.join(' + ');
};

export const eventMatchesShortcut = (e: KeyboardEvent, shortcutString: string): boolean => {
  if (!shortcutString) return false;

  const rawParts = shortcutString.split('+').map(p => p.trim());
  const needsCtrl = rawParts.some(p => p.toLowerCase() === 'ctrl' || p.toLowerCase() === 'control');
  const needsMeta = rawParts.some(p => p.toLowerCase() === 'cmd' || p.toLowerCase() === 'meta');
  const needsAlt = rawParts.some(p => p.toLowerCase() === 'alt');
  const needsShift = rawParts.some(p => p.toLowerCase() === 'shift');

  const mainKey = rawParts.find(p => !['ctrl', 'control', 'cmd', 'meta', 'alt', 'shift'].includes(p.toLowerCase()));
  if (!mainKey) return false;

  const hasCtrl = e.ctrlKey || (needsMeta && e.metaKey);
  const hasAlt = e.altKey;
  const hasShift = e.shiftKey;

  if (needsCtrl && !hasCtrl) return false;
  if (!needsCtrl && (e.ctrlKey || e.metaKey)) return false;
  if (needsAlt && !hasAlt) return false;
  if (!needsAlt && hasAlt) return false;
  if (needsShift && !hasShift) return false;
  if (!needsShift && hasShift && mainKey.length > 1) return false;

  // Key match
  if (mainKey.toLowerCase() === 'space') {
    return e.code === 'Space' || e.key === ' ';
  }
  if (mainKey.toLowerCase() === 'arrowleft') {
    return e.key === 'ArrowLeft';
  }
  if (mainKey.toLowerCase() === 'arrowright') {
    return e.key === 'ArrowRight';
  }
  if (mainKey.toLowerCase() === 'arrowup') {
    return e.key === 'ArrowUp';
  }
  if (mainKey.toLowerCase() === 'arrowdown') {
    return e.key === 'ArrowDown';
  }
  if (mainKey.toLowerCase() === 'pagedown') {
    return e.key === 'PageDown';
  }
  if (mainKey.toLowerCase() === 'pageup') {
    return e.key === 'PageUp';
  }

  return e.key.toLowerCase() === mainKey.toLowerCase();
};

export const captureKeyFromEvent = (e: KeyboardEvent): string | null => {
  // Ignore bare modifier keys
  if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
    return null;
  }

  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey && e.key.length > 1) parts.push('Shift');

  if (e.code === 'Space' || e.key === ' ') {
    parts.push('Space');
  } else if (e.key.startsWith('Arrow')) {
    parts.push(e.key);
  } else if (e.key === 'PageDown' || e.key === 'PageUp') {
    parts.push(e.key);
  } else {
    parts.push(e.key.length === 1 ? e.key.toLowerCase() : e.key);
  }

  return parts.join('+');
};
