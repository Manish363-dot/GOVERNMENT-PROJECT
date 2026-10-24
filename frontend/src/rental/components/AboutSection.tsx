import React from 'react';
import { Building2, Award, Landmark, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AboutSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <section id="about" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Column: Official Context */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{t.about.tag}</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight leading-tight font-poppins">
              {t.about.title}
            </h2>

            <div className="space-y-3 text-slate-600 text-sm sm:text-base leading-relaxed">
              <p>{t.about.desc1}</p>
              <p>{t.about.desc2}</p>
            </div>

            {/* Key Pillars */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {t.about.keyPoint1}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {t.about.keyPoint2}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800">
                  {t.about.keyPoint3}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Infographic Cards */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
                <Landmark className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-[#0b1b36]">11</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {isHi ? 'विकास खंड (Development Blocks)' : 'Development Blocks'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-emerald-700">240+</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {isHi ? 'व्यापारिक दुकानें एवं परिसर' : 'Commercial Shops & Units'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-amber-700">100%</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {isHi ? 'डिजिटल रसीद एवं ई-लेजर' : 'Digital Receipts & Ledger'}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-3">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-2xl font-black text-purple-700">24x7</h4>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {isHi ? 'ऑनलाइन पोर्टल उपलब्धता' : 'Online Portal Accessibility'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
