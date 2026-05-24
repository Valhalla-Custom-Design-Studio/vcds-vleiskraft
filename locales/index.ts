import { af } from './af';
import { en } from './en';
import { Language } from '@/types';

const translations = { af, en };

export function t(key: keyof typeof en, lang: Language = 'af'): string {
  return (translations[lang] as Record<string, string>)[key] ?? (translations['en'] as Record<string, string>)[key] ?? key;
}
