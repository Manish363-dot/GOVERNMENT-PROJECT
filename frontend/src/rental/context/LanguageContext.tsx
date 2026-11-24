import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Language, translations } from '../translations/translations';

export interface LanguageContextType {
  language: Language;
  isHi: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: typeof translations['hi'];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = (): LanguageContextType => {
  const { i18n } = useTranslation();

  // Directly derive the active language from i18n to ensure 100% synchronous rendering with zero lag or glitches
  const currentLang: Language = (
    i18n.language?.startsWith('en')
      ? 'en'
      : (typeof window !== 'undefined' && (localStorage.getItem('app_lang') === 'en' || localStorage.getItem('rental_lang') === 'en'))
      ? 'en'
      : 'hi'
  );

  const isHi = currentLang === 'hi';

  const setLanguage = (lang: Language) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rental_lang', lang);
      localStorage.setItem('app_lang', lang);
      document.documentElement.lang = lang;
    }
    if (i18n && i18n.changeLanguage && i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = currentLang === 'hi' ? 'en' : 'hi';
    setLanguage(nextLang);
  };

  return {
    language: currentLang,
    isHi,
    setLanguage,
    toggleLanguage,
    t: translations[currentLang] || translations['hi'],
  };
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const value = useLanguage();

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
