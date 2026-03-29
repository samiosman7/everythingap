"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeId = "midnight" | "ember" | "harbor" | "grove" | "nocturne" | "graphite";

const DEFAULT_THEME: ThemeId = "graphite";

export const APP_THEMES: Array<{
  id: ThemeId;
  name: string;
  description: string;
}> = [
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep ink-black surfaces with cool steel text and amber highlights.",
  },
  {
    id: "ember",
    name: "Ember",
    description: "Warm charcoal with clay and brass accents.",
  },
  {
    id: "harbor",
    name: "Harbor",
    description: "Slate blue with cool mist and sea-glass accents.",
  },
  {
    id: "grove",
    name: "Grove",
    description: "Deep green with moss and linen accents.",
  },
  {
    id: "nocturne",
    name: "Nocturne",
    description: "Dark plum-black with rose-gold accents and softer contrast.",
  },
  {
    id: "graphite",
    name: "Graphite",
    description: "Neutral graphite with crisp silver text and electric blue highlights.",
  },
];

const STORAGE_KEY = "everythingap_theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    const resolvedTheme =
      stored === "midnight"
        ? DEFAULT_THEME
        : stored && APP_THEMES.some(item => item.id === stored)
          ? stored
          : DEFAULT_THEME;

    if (resolvedTheme) {
      setThemeState(resolvedTheme);
      document.documentElement.dataset.theme = resolvedTheme;
      window.localStorage.setItem(STORAGE_KEY, resolvedTheme);
      return;
    }

    document.documentElement.dataset.theme = DEFAULT_THEME;
  }, []);

  function setTheme(nextTheme: ThemeId) {
    setThemeState(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
  }

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
