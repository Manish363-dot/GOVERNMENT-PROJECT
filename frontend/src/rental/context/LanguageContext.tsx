import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, translations } from '../translations/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations['hi'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  const getResolvedLang = (): Language => {
    if (i18n.language?.startsWith('en')) return 'en';
    const saved = localStorage.getItem('app_lang') || localStorage.getItem('rental_lang');
    return saved === 'en' ? 'en' : 'hi';
  };

  const [language, setLanguageState] = useState<Language>(getResolvedLang);

  // Synchronize state immediately whenever i18n language switches
  useEffect(() => {
    const handleLangChange = (lng: string) => {
      const nextLang: Language = lng.startsWith('en') ? 'en' : 'hi';
      setLanguageState(nextLang);
      localStorage.setItem('rental_lang', nextLang);
      localStorage.setItem('app_lang', nextLang);
      document.documentElement.lang = nextLang;
    };

    // Set initial sync
    handleLangChange(i18n.language || 'hi');

    i18n.on('languageChanged', handleLangChange);
    return () => {
      i18n.off('languageChanged', handleLangChange);
    };
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('rental_lang', lang);
    localStorage.setItem('app_lang', lang);
    document.documentElement.lang = lang;
    if (i18n && i18n.changeLanguage) {
      i18n.changeLanguage(lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    t: translations[language] || translations['hi'],
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
