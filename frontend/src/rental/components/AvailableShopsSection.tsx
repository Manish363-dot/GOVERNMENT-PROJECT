import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { rentalPropertyApi } from '../services/rentalProperty.service';

export const AvailableShopsSection: React.FC = () => {
  const { i18n } = useTranslation();
  const { language } = useLanguage();
  const isHi = i18n.language === 'hi' || (language === 'hi' && !i18n.language?.startsWith('en'));

  const [availableCount, setAvailableCount] = useState<number | null>(null);

  useEffect(() => {
    rentalPropertyApi
      .listPublicAvailableProperties(false)
      .then((res) => {
        if (res?.data && Array.isArray(res.data)) {
          setAvailableCount(res.data.length);
        }
      })
      .catch(() => {
        // Non-blocking count check
      });
  }, []);

  return (
    <section
      id="available-shops"
      className="py-14 sm:py-20 bg-white border-b border-slate-200 scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-2 sm:pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
                {isHi
                  ? 'आवंटन हेतु उपलब्ध दुकानें एवं परिसर'
                  : 'Available Commercial Shops for Allotment'}
              </h2>
              <div className="h-1 w-20 bg-emerald-400 rounded-full mt-3 mb-6" />
            </div>

            {availableCount !== null && (
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-4 sm:mb-0">
                {isHi
                  ? `${availableCount} रिक्त इकाइयाँ वर्तमान में उपलब्ध`
                  : `${availableCount} Vacant Units Currently Available`}
              </span>
            )}
          </div>

          <div className="bg-slate-50/70 rounded-2xl border border-slate-200/90 p-6 sm:p-8 text-slate-700 text-sm sm:text-base leading-relaxed space-y-4">
            {isHi ? (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">
                    कार्यालय जिला पंचायत अल्मोड़ा
                  </strong>{' '}
                  के स्वामित्व वाली समस्त रिक्त वाणिज्यिक दुकानें, स्टॉल, गोदाम एवं कार्यालय परिसर पात्र नागरिकों व व्यापारियों के पारदर्शी आवंटन हेतु सार्वजनिक पोर्टल पर सूचीबद्ध किए गए हैं।
                </p>
                <p>
                  इच्छुक आवेदक बिना कार्यालय आए सभी उपलब्ध दुकानों की वास्तविक तस्वीरें, कुल क्षेत्रफल (Sq. Ft), निर्धारित मासिक किराया (18% जीएसटी विवरण सहित) तथा संबंधित बाजार/स्थान का पूरा पता ऑनलाइन देख सकते हैं और आवंटन प्रक्रिया हेतु सीधे विभागीय प्रकोष्ठ से संपर्क कर सकते हैं।
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong className="text-slate-900 font-bold">
                    Office of Zila Panchayat Almora
                  </strong>{' '}
                  publishes all currently vacant commercial shops, roadside stalls, warehouses, and office spaces owned by the department for transparent public allotment.
                </p>
                <p>
                  Prospective applicants can inspect site photographs, floor area dimensions (Sq. Ft), approved monthly rent (with 18% GST breakdown), and complete market addresses online before initiating an allotment inquiry with the office.
                </p>
              </>
            )}

            <div className="pt-2">
              <Link
                to="/rental/available-shops"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#0B3B60] hover:bg-slate-900 text-white text-sm font-bold shadow-sm transition group"
              >
                <span>
                  {isHi
                    ? 'उपलब्ध दुकानों की संपूर्ण सूची देखें'
                    : 'View Available Shops Directory'}
                </span>
                <ArrowRight className="w-4 h-4 text-amber-300 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvailableShopsSection;
