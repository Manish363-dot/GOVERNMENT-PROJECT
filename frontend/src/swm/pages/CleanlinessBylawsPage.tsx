import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DocumentsSection } from '../components/DocumentsSection';


export function CleanlinessBylawsPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* ── Top Government Banner (Slim) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800/80 shadow-xs">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="w-1.5 h-5 sm:h-6 bg-amber-400 rounded-full shrink-0" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-poppins text-white tracking-tight leading-tight">
                  {isHi ? 'ग्रामीण स्वच्छता उपविधियाँ — 2023' : 'Rural Cleanliness Bylaws — 2023'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Document Section (Single Document Mode: No top slider arrows, No tabs) ── */}
      <DocumentsSection 
        singleDocId="cleanliness"
        isStandalonePage={true} 
      />
    </div>
  );
}

export default CleanlinessBylawsPage;
