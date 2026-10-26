import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Clock
} from 'lucide-react';
import { useRentalComingSoon } from '@/contexts/RentalComingSoonContext';

export const ZilaServicesHubSection = React.memo(() => {
  const { i18n } = useTranslation();
  const { openRentalComingSoon } = useRentalComingSoon();
  const isHi = i18n.language === 'hi';

  return (
    <section id="services-hub" className="py-14 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="pt-6 sm:pt-8 mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            {isHi ? 'डिजिटल पोर्टल' : 'Digital Portals'}
          </h2>
          <div className="h-1 w-20 bg-amber-400 rounded-full mt-3 mb-6" />
        
        </div>

        {/* 2 Primary Featured Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-12">

          {/* PORTAL 1: SAFAI PORTAL (Active & Live) */}
          <div className="bg-gradient-to-br from-emerald-900 via-teal-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {isHi ? 'ठोस अपशिष्ट प्रबंधन एवं सफाई पोर्टल' : 'Solid Waste Management & Safai Portal'}
                </h3>
              </div>

              <p className="text-slate-200 text-sm leading-relaxed mb-6">
                {isHi
                  ? 'जनपद अल्मोड़ा के ग्रामीण व उपनगरीय क्षेत्रों में कचरा संकलन, शिकायत पंजीकरण, जीपीएस वाहन लाइव ट्रैकिंग, कचरा पृथक्करण दिशा-निर्देश, एवं स्वच्छता शपथ प्रणाली।'
                  : 'District-wide rural waste collection, live GPS sanitation fleet tracking, instant citizen grievance registration & tracking, and Swachhata pledge.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-emerald-800/60 flex flex-wrap items-center gap-3">
              <Link
                to="/safai-portal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs sm:text-sm hover:bg-emerald-400 transition-colors shadow-md"
              >
                <span>{isHi ? 'सफाई पोर्टल में प्रवेश करें' : 'Open Safai Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* PORTAL 2: COMMERCIAL RENTAL & LEASE (Coming Soon Mode) */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-indigo-500/30 shadow-lg relative overflow-hidden flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {isHi ? 'दुकान आवंटन, संपत्ति एवं किराया प्रबंधन पोर्टल' : 'Commercial Asset, Shop Allotment & Rental Management Portal'}
                </h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-semibold">
                  <Clock className="w-3 h-3" />
                  {isHi ? 'शीघ्र उपलब्ध' : 'Coming Soon'}
                </span>
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा की रिक्त दुकानों, भूमि, गैरेज एवं अन्य संपत्तियों को किराये पर उपलब्ध कराने, ऑनलाइन आवेदन, किरायेदारी प्रबंधन और किराया भुगतान की प्रक्रिया को सरल, पारदर्शी एवं सुविधाजनक बनाने के लिए एक डिजिटल पहल।'
                  : 'A digital initiative by the District Panchayat Almora to simplify, ensure transparency, and facilitate the process of renting out vacant shops, lands, garages, and other properties. It allows for online applications, tenancy management, and rent payments.'}
              </p>
            </div>
            {/* Quick Actions */}
            <div className="pt-4 border-t border-indigo-800/60 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={openRentalComingSoon}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-colors shadow-md cursor-pointer active:scale-95"
              >
                <span>{isHi ? 'किराया पोर्टल में प्रवेश करें' : 'Open Rental Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});

ZilaServicesHubSection.displayName = 'ZilaServicesHubSection';

