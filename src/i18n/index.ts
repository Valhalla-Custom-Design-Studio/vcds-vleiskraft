import { useState, useCallback } from "react";
import en from "./en.json";
import af from "./af.json";

export type Lang = "en" | "af";
const translations: Record<Lang, any> = { en, af };

// ─── Global lang state (simple module-level for now) ─────────────────────────
let _lang: Lang = "en";
const _listeners: Set<() => void> = new Set();

export function setGlobalLang(lang: Lang) {
  _lang = lang;
  _listeners.forEach(fn => fn());
}

export function getGlobalLang(): Lang {
  return _lang;
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useI18n() {
  const [lang, setLang] = useState<Lang>(_lang);

  const toggleLang = useCallback(() => {
    const next: Lang = lang === "en" ? "af" : "en";
    setGlobalLang(next);
    setLang(next);
  }, [lang]);

  const t = useCallback((key: string): string => {
    const parts = key.split(".");
    let val: any = translations[lang];
    for (const p of parts) val = val?.[p];
    return typeof val === "string" ? val : key;
  }, [lang]);

  return { t, lang, toggleLang };
}

// ─── Standalone t() for class components / non-hook contexts ─────────────────
export function t(key: string, lang?: Lang): string {
  const l = lang ?? _lang;
  const parts = key.split(".");
  let val: any = translations[l];
  for (const p of parts) val = val?.[p];
  return typeof val === "string" ? val : key;
}

// ─── Legacy compat: flat key lookup (for src/locales and locales usage) ───────
export function tFlat(key: string, lang?: Lang): string {
  const l = lang ?? _lang;
  // Try nested first, then flat search across all sections
  const nested = t(key, l);
  if (nested !== key) return nested;
  // Flat search
  const all = translations[l];
  for (const section of Object.values(all)) {
    if (typeof section === "object" && section !== null) {
      const found = (section as any)[key];
      if (typeof found === "string") return found;
    }
  }
  return key;
}
