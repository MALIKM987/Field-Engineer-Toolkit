import { createContext, createElement, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { de } from "./de";
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { pl } from "./pl";

export type LanguageCode = "pl" | "en" | "de" | "es" | "fr";
export type TranslationKey = keyof typeof pl;

const LANGUAGE_STORAGE_KEY = "field-engineer-toolkit.language";

export const languageOptions: Array<{ code: LanguageCode; label: string }> = [
  { code: "pl", label: "Polski" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
];

const dictionaries: Record<LanguageCode, typeof pl> = {
  de,
  en,
  es,
  fr,
  pl,
};

interface I18nContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function parseStoredLanguage(rawValue: string | null): LanguageCode {
  if (!rawValue) {
    return "pl";
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    return typeof parsedValue === "string" && parsedValue in dictionaries
      ? (parsedValue as LanguageCode)
      : "pl";
  } catch {
    return "pl";
  }
}

function interpolate(value: string, params?: Record<string, string | number>): string {
  if (!params) {
    return value;
  }

  return Object.entries(params).reduce(
    (current, [key, replacement]) => current.split(`{${key}}`).join(String(replacement)),
    value,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useLocalStorage<LanguageCode>(
    LANGUAGE_STORAGE_KEY,
    "pl",
    parseStoredLanguage,
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => interpolate(dictionaries[language][key] ?? pl[key], params),
    }),
    [language, setLanguage],
  );

  return createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside LanguageProvider.");
  }

  return context;
}
