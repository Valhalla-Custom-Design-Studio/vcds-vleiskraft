import { useState, useCallback } from "react";
import en from "./en.json";
import af from "./af.json";
type Lang = "en" | "af";
const translations = { en, af };
export function useI18n() {
  const [lang, setLang] = useState<Lang>("en");
  const toggleLang = useCallback(() => setLang(l => l === "en" ? "af" : "en"), []);
  const t = useCallback((key: string): string => {
    const parts = key.split(".");
    let val: any = translations[lang];
    for (const p of parts) val = val?.[p];
    return val ?? key;
  }, [lang]);
  return { t, lang, toggleLang };
}
