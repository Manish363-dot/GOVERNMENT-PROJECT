import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import hiTranslations from './locales/hi.json';

// Get stored language or default to 'en'
const storedLang = localStorage.getItem('app_lang') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: enTranslations,
      hi: hiTranslations,
    },
    lng: storedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already safe from xss
    },
  });

// Set lang attribute on <html> for global CSS targeting (e.g., bold Hindi text)
document.documentElement.lang = storedLang;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
});

export default i18n;

