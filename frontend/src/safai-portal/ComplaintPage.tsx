import React, { useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Headphones, 
  FileText,
  Search
} from 'lucide-react';
import { ComplaintForm } from './ComplaintForm';

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
                {isHi ? 'जन शिकायत निवारण एवं ट्रैकिंग पोर्टल' : 'Public Grievance Redressal & Tracking Portal'}
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
                {isHi 
                  ? 'जिला पंचायत अल्मोड़ा — स्वच्छ भारत मिशन (ग्रामीण) के अंतर्गत ठोस अपशिष्ट प्रबंधन, सफाई व्यवस्था एवं वाहन संचालन संबंधी समस्याओं का समयबद्ध समाधान व पारदर्शी डिजिटल ट्रैकिंग।'
                  : 'District Panchayat Almora — Timely redressal and 100% transparent tracking for solid waste management, sanitation issues, and vehicle operations under Swachh Bharat Mission (Grameen).'}
              </p>
            </div>

            {/* Quick Action Buttons to Switch Tabs */}
            <div className="flex flex-row md:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleTabChange('submit')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                  currentTab === 'submit'
                    ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('track')}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border ${
                  currentTab === 'track'
                    ? 'bg-amber-500 text-navy-950 border-amber-400 shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                }`}
              >
                <Search className="w-4 h-4" />
                <span>{isHi ? 'शिकायत ट्रैक करें' : 'Track Status'}</span>
              </button>
            </div>
          </div>

          <div className="h-1 w-24 bg-amber-400 rounded-full mt-6"></div>
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
