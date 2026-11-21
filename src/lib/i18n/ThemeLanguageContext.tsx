import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Theme, translations, TranslationDictionary } from './translations.ts';

interface ThemeLanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme; // 'light' (Blanc) | 'dark' (Noir)
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  t: (key: keyof TranslationDictionary, fallback?: string) => string;
  isRTL: boolean;
}

const ThemeLanguageContext = createContext<ThemeLanguageContextType | null>(null);

const STORAGE_KEY_LANG = 'immovex_lang';
const STORAGE_KEY_THEME = 'immovex_theme';

export const ThemeLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Language state (defaults to 'fr')
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && (saved === 'fr' || saved === 'en' || saved === 'ar' || saved === 'es')) {
        return saved;
      }
    }
    return 'fr';
  });

  // 2. Theme state: 'light' (Blanc) | 'dark' (Noir) - defaults to 'light'
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      // Check system preference if no manual setting
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply Language and RTL to <html>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_LANG, language);
    } catch {
      // ignore
    }

    const htmlEl = document.documentElement;
    htmlEl.lang = language;
    if (language === 'ar') {
      htmlEl.dir = 'rtl';
      htmlEl.classList.add('rtl');
    } else {
      htmlEl.dir = 'ltr';
      htmlEl.classList.remove('rtl');
    }
  }, [language]);

  // Apply Theme (Noir / Blanc) to <html>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {
      // ignore
    }

    const htmlEl = document.documentElement;
    htmlEl.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      htmlEl.classList.add('dark');
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      htmlEl.classList.remove('dark');
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Translation helper
  const t = (key: keyof TranslationDictionary, fallback?: string): string => {
    const dict = translations[language] || translations.fr;
    const value = dict[key];
    if (value !== undefined) return value;
    if (translations.fr[key] !== undefined) return translations.fr[key];
    return fallback || String(key);
  };

  const isRTL = language === 'ar';

  return (
    <ThemeLanguageContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        t,
        isRTL,
      }}
    >
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useThemeLanguage = () => {
  const context = useContext(ThemeLanguageContext);
  if (!context) {
    throw new Error('useThemeLanguage must be used within a ThemeLanguageProvider');
  }
  return context;
};
