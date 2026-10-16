import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ServerErrorPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col items-center justify-center px-4 py-8 sm:py-12 select-none font-sans overflow-x-hidden">
      <div className="w-full max-w-4xl lg:max-w-5xl flex flex-col items-center text-center animate-fade-in my-auto">
        
        {/* ── Big & Prominent Robot & Server 500 Illustration ── */}
        <div className="w-full flex justify-center mb-4 sm:mb-6">
          <img
            src="/assets/500-robot.jpg"
            alt="500 Internal Server Error - Robot unplugged server"
            className="w-full h-auto max-h-[48vh] sm:max-h-[54vh] object-contain select-none transition-transform duration-300 hover:scale-[1.01]"
            loading="eager"
          />
        </div>

        {/* ── Headline ── */}
        <h1 className="font-poppins font-black text-4xl sm:text-6xl text-slate-800 tracking-tight leading-tight mb-3">
          Whoops!
        </h1>

        {/* ── Subtitle ── */}
        <div className="space-y-1.5 text-slate-500 font-sans text-base sm:text-lg font-normal max-w-xl mx-auto mb-8 leading-relaxed">
          <p>Our servers seem to be taking a break.</p>
          <p>We are doing our best to fix it, so check back soon!</p>
          <p>सर्वर पर कोई अस्थायी समस्या आ गई है, कृपया मुख्य पृष्ठ पर जाएं</p>
        </div>

        {/* ── Action Button: ONLY 'Go to Homepage' (NO 'Try Again' button) ── */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3 px-8 py-3.5 sm:px-10 sm:py-4 rounded-xl bg-[#0e3b4a] hover:bg-[#082832] active:bg-[#051c23] text-white font-bold text-base sm:text-lg shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 tracking-wide"
          >
            <Home className="w-5 h-5 text-emerald-400" />
            <span>{isHi ? 'मुख्य पृष्ठ पर जाएं (Go to Homepage)' : 'Go to Homepage'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
