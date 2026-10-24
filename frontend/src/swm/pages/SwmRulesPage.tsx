import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DocumentsSection } from '../components/DocumentsSection';
import { ChevronRight, Home, ShieldCheck, ArrowRight } from 'lucide-react';

export function SwmRulesPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-16">
      {/* ── Top Government Banner ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-10 sm:py-14 overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />

        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-2xl sm:text-4xl font-extrabold font-poppins text-white tracking-tight leading-tight mb-3">
                {isHi ? 'ठोस अपशिष्ट प्रबंधन नियम, 2026' : 'Solid Waste Management Rules, 2026'}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                {isHi
                  ? 'पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय (MoEFCC), भारत सरकार द्वारा अधिसूचित नए केंद्रीय ठोस अपशिष्ट प्रबंधन नियम एवं राष्ट्रीय दिशा-निर्देश।'
                  : 'Official statutory rules notified by the Ministry of Environment, Forest and Climate Change (MoEFCC), Govt. of India, emphasizing source segregation, bulk waste generator rules, and environmental compliance.'}
              </p>
            </div>
          </div>

          <div className="h-1 w-24 bg-amber-400 rounded-full mt-6"></div>
        </div>
      </div>

      {/* ── Main Document Section (Single Document Mode: No top slider arrows, No tabs) ── */}
      <DocumentsSection 
        singleDocId="rules-2026"
        isStandalonePage={true} 
      />
    </div>
  );
}

export default SwmRulesPage;
