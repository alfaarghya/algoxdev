"use client";

import { createContext, useEffect, useState } from "react";
import type {
  ResolvedTheme,
  Theme,
  ThemeContextType,
} from "@/types/theme.type";
import { THEME_STORAGE_KEY } from "@/utils/config";

/* Get the system theme */
function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/* Get User preferred theme */
function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "dark" || stored === "light" || stored === "system") {
      return stored;
    }
  } catch {
    // theme not stored on localStorage
  }
  return null;
}

/* Store theme on localStorage */
function storeTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // localStorage might not be available
  }
}

// Theme Context
export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined,
);

// Theme Provider
export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");

  //Initialize: get user preferred theme from system or local storage
  useEffect(() => {
    // Check: localStorage for theme
    const stored = getStoredTheme();
    if (stored) {
      //Load: the stored theme
      setTheme(stored);
    } else {
      // First Visit: set Theme to system preferred
      setTheme("system");
      storeTheme("system");
    }
  }, []);

  //Update: theme on click
  useEffect(() => {
    const updateResolvedTheme = () => {
      const resolved = theme === "system" ? getSystemTheme() : theme;
      setResolvedTheme(resolved);

      // Apply or remove dark class on HTML
      const root = document.documentElement;
      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateResolvedTheme();

    // Listen: system theme changes when in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => updateResolvedTheme();
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  const updateTheme = (theme: Theme) => {
    setTheme(theme);
    storeTheme(theme);
  };

  return (
    <ThemeContext value={{ theme, resolvedTheme, updateTheme }}>
      {children}
    </ThemeContext>
  );
}
