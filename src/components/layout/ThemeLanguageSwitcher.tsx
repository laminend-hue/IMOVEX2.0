import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Globe, Check, ChevronDown } from 'lucide-react';
import { useThemeLanguage } from '../../lib/i18n/ThemeLanguageContext.tsx';
import { Language } from '../../lib/i18n/translations.ts';

const LANGUAGES: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'ar', name: 'Arabe', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'es', name: 'Espagnol', nativeName: 'Español', flag: '🇪🇸' },
];

export const ThemeLanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage, theme, toggleTheme, t, isRTL } = useThemeLanguage();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close language dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLangObj = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <div className="flex items-center gap-1.5 sm:gap-2">
      
      {/* 1. SÉLECTEUR DE COULEUR (BLANC / NOIR) */}
      <button
        onClick={toggleTheme}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
          theme === 'dark'
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700 hover:border-amber-400/40'
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
        }`}
        title={theme === 'dark' ? `${t('themeWhite')} (Mode Clair)` : `${t('themeBlack')} (Mode Sombre)`}
        aria-label={t('themeToggle')}
      >
        {theme === 'dark' ? (
          <>
            <Moon className="w-3.5 h-3.5 fill-amber-300 text-amber-300 animate-in spin-in-12 duration-300" />
            {!compact && <span className="text-[11px] text-slate-200 hidden sm:inline">{t('themeBlack')}</span>}
          </>
        ) : (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500 fill-amber-400 animate-in spin-in-45 duration-300" />
            {!compact && <span className="text-[11px] text-slate-700 hidden sm:inline">{t('themeWhite')}</span>}
          </>
        )}
      </button>

      {/* 2. SÉLECTEUR DE LANGUE (FR, EN, AR, ES) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs ${
            theme === 'dark'
              ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
          }`}
          title={t('languageSelect')}
          aria-haspopup="true"
          aria-expanded={isLangOpen}
        >
          <span className="text-sm leading-none" role="img" aria-label={currentLangObj.name}>
            {currentLangObj.flag}
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wide">
            {currentLangObj.code}
          </span>
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {isLangOpen && (
          <div
            className={`absolute mt-2 w-48 rounded-2xl shadow-xl border p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
              isRTL ? 'left-0' : 'right-0'
            } ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-700 text-slate-100 shadow-black/60'
                : 'bg-white border-slate-200 text-slate-900 shadow-slate-300/40'
            }`}
          >
            <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-400'
            }`}>
              {t('languageSelect')}
            </div>

            <div className="space-y-0.5 mt-1">
              {LANGUAGES.map((lang) => {
                const isSelected = language === lang.code;
                return (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer text-left ${
                      isSelected
                        ? theme === 'dark'
                          ? 'bg-emerald-950/60 text-emerald-300 font-bold'
                          : 'bg-emerald-50 text-emerald-800 font-bold'
                        : theme === 'dark'
                        ? 'hover:bg-slate-800 text-slate-300'
                        : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <div className="flex flex-col">
                        <span className="leading-tight">{lang.nativeName}</span>
                        {lang.name !== lang.nativeName && (
                          <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>
                            {lang.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
