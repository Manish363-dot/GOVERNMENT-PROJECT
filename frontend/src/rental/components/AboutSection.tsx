import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import { api } from '@/services/api';

export const AboutSection: React.FC = React.memo(() => {
  const { i18n } = useTranslation();
  const { language } = useLanguage();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  const [stats, setStats] = useState({
    blocks: 11,
    digitalReceipts: '100%',
    totalShops: 240,
    totalTenants: 180,
  });

  useEffect(() => {
    let isMounted = true;
    const fetchLiveStats = async () => {
      try {
        const res = await api.get<{
          success: boolean;
          data: { blocks: number; digitalReceipts: string; totalShops: number; totalTenants: number };
        }>('/rental/stats');
        if (isMounted && res?.data) {
          setStats((prev) => ({
            ...prev,
            totalShops: typeof res.data.totalShops === 'number' ? res.data.totalShops : prev.totalShops,
            totalTenants: typeof res.data.totalTenants === 'number' ? res.data.totalTenants : prev.totalTenants,
          }));
        }
      } catch (err) {
        console.warn('Real-time rental stats unavailable, using baseline count:', err);
      }
    };

    fetchLiveStats();
    // Refresh stats every 30 seconds for live admin updates
    const interval = setInterval(fetchLiveStats, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section id="about" className="py-14 sm:py-20 bg-gradient-to-b from-white via-slate-50/70 to-blue-50/30 border-b border-slate-200 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header & Introduction */}
        <div className="pt-2 sm:pt-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            {isHi ? 'वाणिज्यिक परिसंपत्ति एवं किराया प्रबंधन - परिचय' : 'About - Commercial Asset & Rental Management'}
          </h2>
          <div className="h-1 w-20 bg-emerald-400 rounded-full mt-3 mb-6" />

          {/* Introductory Overview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {isHi ? (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">किराया प्रबंधन </strong>
                  पोर्टल उत्तराखंड के जिला पंचायत अल्मोड़ा के अंतर्गत आने वाली किराये की संपत्तियों के प्रबंधन को सरल, पारदर्शी एवं आधुनिक बनाने के उद्देश्य से विकसित एक डिजिटल पहल है। यह पोर्टल किराये की दुकानों एवं अन्य संपत्तियों, किरायेदारों के विवरण, मासिक किराया, भुगतान इतिहास, बकाया राशि, रसीदों, सूचनाओं तथा अन्य किराया-संबंधी सेवाओं के प्रबंधन हेतु एक केंद्रीकृत डिजिटल मंच प्रदान करता है।
                </p>
                <p>
                  इस पोर्टल के माध्यम से किरायेदार सुरक्षित रूप से अपनी किराया संबंधी जानकारी देख सकते हैं, भुगतान का विवरण प्राप्त कर सकते हैं, बकाया राशि की जानकारी देख सकते हैं, भुगतान की रसीदें डाउनलोड कर सकते हैं तथा महत्वपूर्ण सूचनाओं से अवगत रह सकते हैं। वहीं, अधिकृत अधिकारी संपत्तियों एवं किरायेदारों का प्रबंधन, किराया संग्रह, वित्तीय अभिलेखों का रखरखाव तथा आवश्यक रिपोर्ट तैयार करने जैसे कार्य अधिक प्रभावी ढंग से कर सकते हैं।
                </p>
                <p>
                  इस पोर्टल का उद्देश्य कागजी कार्यवाही को कम करना, प्रशासनिक कार्यों में दक्षता बढ़ाना, वित्तीय पारदर्शिता सुनिश्चित करना तथा नागरिकों को सरल, सुविधाजनक और विश्वसनीय किराया सेवाएँ उपलब्ध कराना है।
                </p>
                <p>
                  <strong className="text-slate-900 font-bold">हमारा दृष्टिकोण: </strong>
                  जिला पंचायत अल्मोड़ा के लिए एक पारदर्शी, कुशल एवं नागरिक-अनुकूल डिजिटल किराया प्रबंधन प्रणाली स्थापित करना।
                </p>
                <p>
                  इस पहल के अंतर्गत कार्यालय काउंटर पर सुगम भुगतान प्रविष्टि, प्रमाणित कंप्यूटरीकृत डिजिटल रसीद जारी करने, बिना किसी पासवर्ड या लॉगिन के केवल 10-अंकीय पंजीकृत मोबाइल नंबर द्वारा किरायेदारों को उनकी चालू माह की स्थिति व पूर्ण खाता बही (लेजर) उपलब्ध कराने पर विशेष ध्यान दिया जाता है। प्रशासनिक पारदर्शिता और किरायेदारों के सहयोग से परिसंपत्तियों का समुचित संवर्धन एवं राजस्व व्यवस्था का सुदृढ़ीकरण सुनिश्चित होता है।
                </p>
                <p className="pt-1 text-slate-800 font-medium">
                  <strong className="text-slate-900 font-bold">हमारा संकल्प है</strong> — पारदर्शी व्यवस्था, समृद्ध व्यापारी और आत्मनिर्भर अल्मोड़ा।
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">Commercial Asset & Rental Management</strong> is a digital initiative designed to streamline and modernize the management of rental properties under the jurisdiction of Zila Panchayat Almora, Uttarakhand. The portal provides a centralized and transparent platform for managing rental properties, tenant records, monthly rent, payment history, outstanding dues, receipts, notices, and other rental-related services.
                </p>
                <p>
                  Through this portal, tenants can securely access their rental information, view their payment records, check outstanding dues, download receipts, and stay updated with important notices. The administrative system enables authorized officials to efficiently manage properties, maintain financial records, monitor rent collection, and generate reports.
                </p>
                <p>
                  The portal aims to reduce paperwork, improve administrative efficiency, promote financial transparency, and make rental services more accessible, reliable, and convenient for citizens.
                </p>
                <p>
                  <strong className="text-slate-900 font-bold">Our Vision: </strong>
                  To establish a transparent, efficient, and citizen-friendly digital rental management system for Zila Panchayat Almora.
                </p>
                <p>
                  This initiative focuses on streamlined in-office counter payment recording, computerized numbered receipt generation, zero-login public verification of rent dues via registered mobile number, and comprehensive digital ledger statements. Through active administrative coordination and tenant cooperation, we ensure transparent fiscal governance and sustainable maintenance of civic commercial assets.
                </p>
                <p className="pt-1 text-slate-800 font-medium">
                  <strong className="text-slate-900 font-bold">Our Commitment</strong> — Transparent Governance, Prosperous Traders, and a Greener, Self-Reliant Almora.
                </p>
              </>
            )}
          </div>
        </div>

        {/* 4 Key Metric Cards (No Icons, Live Real-Time Registered Shops & Tenants) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-8 sm:mt-10">
          <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <h4 className="text-2xl sm:text-3xl font-black text-[#0b1b36]">{stats.blocks}</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1.5">
              {isHi ? 'विकास खंड' : 'Development Blocks'}
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <h4 className="text-2xl sm:text-3xl font-black text-amber-600">{stats.digitalReceipts}</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1.5">
              {isHi ? 'डिजिटल रसीद एवं ई-लेजर' : 'Digital Receipts & Ledger'}
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <h4 className="text-2xl sm:text-3xl font-black text-emerald-700">{stats.totalShops}</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1.5">
              {isHi ? 'पंजीकृत दुकानें एवं परिसर' : 'Registered Commercial Shops'}
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 sm:p-6 rounded-2xl shadow-xs hover:shadow-md transition-shadow">
            <h4 className="text-2xl sm:text-3xl font-black text-blue-700">{stats.totalTenants}</h4>
            <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1.5">
              {isHi ? 'पंजीकृत व्यावसायिक किरायेदार' : 'Registered Commercial Tenants'}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
});

AboutSection.displayName = 'AboutSection';

export default AboutSection;
