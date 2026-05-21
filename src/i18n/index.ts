import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from './en.json';
import af from './af.json';

export type Lang = 'en' | 'af';

clonst translations: Record<Lang, typeof en> = { en, af };

export function useI18n() {
  const [lang, setLang] = useState<Lang>('af');

  useEffect(() => {
    AsyncStorage.getItem('vleisai_lang').then((stored) => {
      if (stored === 'en' || stored === 'af') setLang(stored);
    });
  }, []);

  const toggleLang = useCallback(() => {
    const next = lang === 'en' ? 'af' : 'en';
    setLang(next);
    AsyncStorage.setItem('vleisai_lang', next);
  }, [lang]);

  const setLanguage = useCallback((l: Lang) => {
    setLang(l);
    AsyncStorage.setItem('vleisai_lang', l);
  }, []);

  const t = translations[lang];

  return { t, lang, toggleLang, setLanguage };
}