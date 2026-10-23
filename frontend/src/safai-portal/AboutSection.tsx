import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ZilaServicesCarousel } from './ZilaServicesCarousel';

export const AboutSection = React.memo(() => {
  const { t } = useTranslation();

  return (
    <section id="about" className="pt-10 sm:pt-28 pb-12 sm:pb-20 bg-slate-50 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Full-width layout */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-green-200 text-green-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-green-200">
            <ShieldCheck className="w-3.5 h-3.5 text-green-900" />
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

          {/* Moving Carousel displaying services and works of Zila Panchayat Almora department */}
          <div className="pt-2">
            <ZilaServicesCarousel />
          </div>
        </div>
      </div>
    </section>
  );
});
