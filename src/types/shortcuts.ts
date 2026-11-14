export type NavArrowMode = 'rtl' | 'ltr';

export interface ShortcutDefinition {
  id: string;
  nameUrdu: string;
  nameEn: string;
  category: 'nav' | 'audio' | 'study' | 'modes';
  defaultKey: string;
  descriptionUrdu: string;
}

export type CustomShortcutsMap = Record<string, string>;
