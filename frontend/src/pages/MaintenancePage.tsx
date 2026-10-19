import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function MaintenancePage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between select-none font-sans overflow-x-hidden relative">

      {/* ── Main Content Area ── */}
      <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col items-center text-center animate-fade-in my-auto px-4 py-8 sm:py-12">
        
        {/* ── Cute Pink Kittens Maintenance Illustration ── */}
        <div className="w-full flex justify-center mb-4 sm:mb-6">
          <picture>
            <source srcSet="/assets/maintenance-cats.webp" type="image/webp" />
            <img
              src="/assets/maintenance-cats.jpg"
              alt="Maintenance work up here - Kitties painting sign"
              className="w-full h-auto max-h-[46vh] sm:max-h-[52vh] object-contain select-none transition-transform duration-300 hover:scale-[1.01]"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>

        {/* ── Headline ── */}
        <h1 className="font-poppins font-black text-3xl sm:text-5xl text-slate-800 tracking-tight leading-tight mb-2">
          Maintenance work up here
        </h1>

        {/* ── Subtitle (Exact tone from reference) ── */}
        <div className="space-y-1 text-slate-500 font-sans text-base sm:text-lg font-normal max-w-xl mx-auto mb-8 leading-relaxed">
          <p>We are working on it. We will be back soon.</p>
          <p>वेबसाइट पर नवीनीकरण कार्य चल रहा है, कृपया थोड़ी देर बाद पुनः देखें</p>
        </div>
      </div>
    </div>
  );
}
