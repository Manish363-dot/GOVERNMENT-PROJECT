import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 border-primary/20 text-navy-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium bg-white/50 backdrop-blur-sm"
    >
      <Languages className="w-4 h-4" />
      {i18n.language === 'en' ? 'हिंदी' : 'English'}
    </Button>
  );
}
