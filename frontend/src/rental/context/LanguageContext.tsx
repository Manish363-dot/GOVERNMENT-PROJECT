import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations } from '../translations/translations';
import i18n from '@/i18n/config';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations['hi'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('rental_lang') || localStorage.getItem('app_lang') || (i18n ? i18n.language : null);
    if (saved && (saved === 'en' || saved.startsWith('en'))) return 'en';
    return 'hi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rental_lang', lang);
    localStorage.setItem('app_lang', lang);
    document.documentElement.lang = lang;
    if (i18n && i18n.changeLanguage && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Synchronize with i18n language changes (e.g. from topbar LanguageSwitcher)
  useEffect(() => {
    const handleLangChange = (lng: string) => {
      const validLang: Language = lng && lng.startsWith('en') ? 'en' : 'hi';
      setLanguageState(validLang);
      localStorage.setItem('rental_lang', validLang);
      localStorage.setItem('app_lang', validLang);
      document.documentElement.lang = validLang;
    };

    if (i18n && i18n.on) {
      i18n.on('languageChanged', handleLangChange);
    }

    const handleCustomEvent = (e: any) => {
      const lng = e?.detail || localStorage.getItem('app_lang') || 'hi';
      handleLangChange(lng);
    };
    window.addEventListener('languageChange', handleCustomEvent);
    window.addEventListener('storage', handleCustomEvent);

    return () => {
      if (i18n && i18n.off) {
        i18n.off('languageChanged', handleLangChange);
      }
      window.removeEventListener('languageChange', handleCustomEvent);
      window.removeEventListener('storage', handleCustomEvent);
    };
  }, []);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

const defaultLanguageContext: LanguageContextType = {
  language: 'hi',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: translations['hi'],
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    return defaultLanguageContext;
  }
  return context;
};
