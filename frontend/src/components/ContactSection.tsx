import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const ContactSection = React.memo(() => {
  const { t } = useTranslation();
  const [showMap, setShowMap] = React.useState(false);
  const mapRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    if (mapRef.current) observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="contact" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-left mb-12 flex flex-col items-start">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-pink-200 text-pink-900 text-xs font-semibold uppercase tracking-wider mb-3 border border-pink-300">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-900" />
            {t('contact.badge')}
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
            {t('contact.title')}
          </h2>
          <p className="text-slate-600 max-w-xl text-sm sm:text-base">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-3.5">
            <Card className="border-slate-200 bg-white shadow-xs rounded-lg">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded bg-navy-900 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">{t('contact.tollFreeLabel')}</p>
                  <p className="font-bold text-navy-900 text-sm">1800-185-1850</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs rounded-lg">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded bg-emerald-800 text-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">{t('contact.emailLabel')}</p>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">amazpalmora@gmail.com</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs rounded-lg">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">{t('contact.hqLabel')}</p>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">{t('contact.hqAddress')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Embed */}
          <Card 
            ref={mapRef}
            className="lg:col-span-2 border-slate-200 bg-white shadow-xs rounded-lg overflow-hidden flex flex-col min-h-[350px] relative bg-slate-100"
          >
            {!showMap && (
              <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400 gap-2">
                <MapPin className="w-8 h-8 animate-bounce" />
                <span className="text-sm font-semibold">Loading Map...</span>
              </div>
            )}
            {showMap && (
              <iframe
                src="https://maps.google.com/maps?q=Zila%20Panchayat%20Office,%20Dharanaula,%20Almora,%20Uttarakhand&t=&z=15&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, flexGrow: 1, minHeight: '350px' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Zila Panchayat Almora Location"
              ></iframe>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
});
