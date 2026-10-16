import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function NotFoundPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-between select-none font-sans overflow-x-hidden relative">

      {/* ── Main Content Area (Full Page Layout) ── */}
      <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col items-center text-center animate-fade-in my-auto px-4 py-8 sm:py-12">
        
        {/* ── 404 Thieves Stealing Page Illustration ── */}
        <div className="w-full flex justify-center mb-4 sm:mb-6">
          <img
            src="/assets/404-thieves.jpg"
            alt="404 Page Not Found - Thieves stealing webpage"
            className="w-full h-auto max-h-[48vh] sm:max-h-[55vh] object-contain select-none transition-transform duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>

        {/* ── Headline ── */}
        <h1 className="font-poppins font-black text-3xl sm:text-5xl text-slate-800 tracking-tight leading-tight mb-2">
          Looks like this page was taken!
        </h1>

        {/* ── Subtitle ── */}
        <div className="space-y-1 text-slate-500 font-sans text-base sm:text-lg font-normal max-w-xl mx-auto mb-8 leading-relaxed">
          <p>The page you are looking for has vanished or never existed.</p>
            <p>
              लगता है आप जिस पृष्ठ की तलाश कर रहे हैं, वह यहाँ उपलब्ध नहीं है.
            </p>
        </div>

        {/* ── Action Button: ONLY 'Go to Homepage' (NO Go Back button as requested) ── */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base sm:text-lg shadow-md hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 tracking-wide"
          >
            <Home className="w-5 h-5 text-blue-200" />
            <span>{isHi ? 'मुख्य पृष्ठ पर जाएं (Go to Homepage)' : 'Go to Homepage'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
