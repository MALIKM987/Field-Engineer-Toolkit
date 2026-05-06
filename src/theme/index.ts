import { createContext, createElement, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";

export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "field-engineer-toolkit.theme";

interface ThemeContextValue {
  resolvedTheme: "light" | "dark";
  setThemeMode: (themeMode: ThemeMode) => void;
  themeMode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function parseStoredTheme(rawValue: string | null): ThemeMode {
  if (!rawValue) {
    return "system";
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    return parsedValue === "light" || parsedValue === "dark" || parsedValue === "system"
      ? parsedValue
      : "system";
  } catch {
    return "system";
  }
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>(
    THEME_STORAGE_KEY,
    "system",
    parseStoredTheme,
  );
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() =>
    typeof window === "undefined" ? "light" : getSystemTheme(),
  );
  const resolvedTheme = themeMode === "system" ? systemTheme : themeMode;

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const updateTheme = () => setSystemTheme(query.matches ? "dark" : "light");
    updateTheme();
    query.addEventListener("change", updateTheme);

    return () => query.removeEventListener("change", updateTheme);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
    document.documentElement.style.colorScheme = resolvedTheme;
  }, [resolvedTheme]);

  const value = useMemo(
    () => ({ resolvedTheme, setThemeMode, themeMode }),
    [resolvedTheme, setThemeMode, themeMode],
  );

  return createElement(ThemeContext.Provider, { value }, children);
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
