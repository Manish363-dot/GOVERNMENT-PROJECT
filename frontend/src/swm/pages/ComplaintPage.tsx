import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ComplaintForm } from '../components/ComplaintForm';

export function ComplaintPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read ?tab=track or /track from URL
  const isTrack = location.pathname.endsWith('/track') || searchParams.get('tab') === 'track';
  const currentTab = isTrack ? 'track' : 'submit';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleTabChange = (newTab: 'submit' | 'track') => {
    setSearchParams({ tab: newTab });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* ── Top Government Banner (Slim) ── */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white relative py-4 sm:py-5 overflow-hidden border-b border-navy-800/80 shadow-xs">
        
        {/* Subtle decorative background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-5 pointer-events-none" />
        
        {/* Government tricolor top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-1.5">
                <span className="w-1.5 h-5 sm:h-6 bg-amber-400 rounded-full shrink-0" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-poppins text-white tracking-tight leading-tight">
                  {isHi ? 'जन शिकायत निवारण एवं ट्रैकिंग पोर्टल' : 'Public Grievance Redressal & Tracking Portal'}
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Interactive Section: ComplaintForm & ComplaintTrack ── */}
      <div className="flex-1 py-8 sm:py-12">
        <ComplaintForm 
          initialTab={currentTab} 
          onTabChange={handleTabChange} 
        />
      </div>
    </div>
  );
}

export default ComplaintPage;
