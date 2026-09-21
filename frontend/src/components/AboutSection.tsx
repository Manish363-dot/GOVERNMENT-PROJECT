import { Truck, MapPin, History, Shield, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function AboutSection() {
  const { t } = useTranslation();

  const capabilities = [
    { icon: Truck, text: t('about.cap1') },
    { icon: MapPin, text: t('about.cap2') },
    { icon: History, text: t('about.cap3') },
    { icon: Shield, text: t('about.cap4') },
  ];

  return (
    <section id="about" className="pt-10 sm:pt-28 pb-12 sm:pb-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Full-width layout — no grid split */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-navy-100 text-navy-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-navy-200">
            <ShieldCheck className="w-3.5 h-3.5 text-navy-700" />
            {t('about.badge')}
          </div>

          <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 mb-5 leading-tight">
            {t('about.title')}
          </h2>

          <p className="text-slate-800 leading-relaxed mb-4 text-sm sm:text-base">
            {t('about.para1')}
          </p>

          <p className="text-slate-800 leading-relaxed mb-3 text-sm sm:text-base">
            {t('about.para2')}
          </p>

          <ul className="list-disc list-inside text-slate-800 leading-relaxed mb-4 text-sm sm:text-base space-y-2 pl-1">
            <li><strong>{t('about.point1Label')}</strong> {t('about.point1Text')}</li>
            <li><strong>{t('about.point2Label')}</strong> {t('about.point2Text')}</li>
            <li><strong>{t('about.point3Label')}</strong> {t('about.point3Text')}</li>
            <li><strong>{t('about.point4Label')}</strong> {t('about.point4Text')}</li>
          </ul>

          <p className="text-slate-800 leading-relaxed mb-8 text-sm sm:text-base">
            {t('about.goal')}
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {capabilities.map((cap) => (
              <div key={cap.text} className="flex items-start gap-3 p-3.5 rounded-lg bg-white border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded bg-navy-900 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <cap.icon className="w-4 h-4" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-navy-900 pt-1 leading-snug">{cap.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
