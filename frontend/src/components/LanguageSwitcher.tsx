import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const isEnglish = i18n.language?.startsWith('en');

  const toggleLanguage = () => {
    const newLang = isEnglish ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
    localStorage.setItem('rental_lang', newLang);
    window.dispatchEvent(new CustomEvent('languageChange', { detail: newLang }));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="h-7 px-2.5 text-[11px] font-bold gap-1.5 border-navy-700 bg-navy-800 text-amber-300 hover:bg-navy-700 hover:text-amber-400 transition-colors shadow-xs rounded"
    >
      <Languages className="w-3.5 h-3.5 text-amber-400" />
      {isEnglish ? 'हिंदी' : 'EN'}
    </Button>
  );
}
