"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeId = "ember" | "harbor" | "grove";

export const APP_THEMES: Array<{
  id: ThemeId;
  name: string;
  description: string;
}> = [
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
];

const STORAGE_KEY = "everythingap_theme";

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>("ember");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeId | null;
    if (stored && APP_THEMES.some(item => item.id === stored)) {
      setThemeState(stored);
      document.documentElement.dataset.theme = stored;
      return;
    }

    document.documentElement.dataset.theme = "ember";
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
