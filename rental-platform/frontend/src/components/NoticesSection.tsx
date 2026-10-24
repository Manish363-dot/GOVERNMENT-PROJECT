import React from 'react';
import { FileText, Download, Calendar, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NoticeItem {
  id: string;
  refNo: string;
  date: string;
  titleHi: string;
  titleEn: string;
  categoryHi: string;
  categoryEn: string;
  isNew?: boolean;
}

const NOTICES_DATA: NoticeItem[] = [
  {
    id: 'N-2026-04',
    refNo: 'पत्रांक: 142/जि.पं./किराया/2026-27',
    date: '15 Oct 2026',
    titleHi: 'जनपद अल्मोड़ा के अंतर्गत 14 रिक्त व्यावसायिक दुकानों के ई-आवंटन एवं नीलामी की विस्तृत सूचना व नियम।',
    titleEn: 'Detailed notification & rules for e-auction and allotment of 14 vacant commercial shops in Almora.',
    categoryHi: 'ई-नीलामी (E-Auction)',
    categoryEn: 'E-Auction',
    isNew: true,
  },
  {
    id: 'N-2026-03',
    refNo: 'पत्रांक: 118/जि.पं./लेखा/2026',
    date: '01 Oct 2026',
    titleHi: 'समस्त सम्मानित दुकान आवंटियों द्वारा प्रत्येक माह की 10 तारीख तक नियमित किराया जमा करने संबंधी आदेश।',
    titleEn: 'Order regarding mandatory monthly rent payment by 10th of every month by all commercial tenants.',
    categoryHi: 'किराया आदेश (Rent Order)',
    categoryEn: 'Rent Order',
    isNew: true,
  },
  {
    id: 'N-2026-02',
    refNo: 'पत्रांक: 89/जि.पं./उपनियम/2026',
    date: '18 Aug 2026',
    titleHi: 'जिला पंचायत दुकानों के सबलेटिंग (उप-किरायेदारी) पर पूर्ण प्रतिबंध एवं दंडात्मक प्रावधानों संबंधी निर्देश।',
    titleEn: 'Strict prohibition of sub-letting of Zila Panchayat shops and punitive actions for violations.',
    categoryHi: 'उपविधि नियम (Bylaws)',
    categoryEn: 'Bylaws',
    isNew: false,
  },
  {
    id: 'N-2026-01',
    refNo: 'पत्रांक: 45/जि.पं./प्रशासन/2026',
    date: '10 May 2026',
    titleHi: 'ऑनलाइन रेंटल पोर्टल के माध्यम से डिजिटल रसीद एवं ऑनलाइन भुगतान सुविधा प्रारंभ करने संबंधी सार्वजनिक विज्ञप्ति।',
    titleEn: 'Public release on commencement of online rent collection & digital receipt issuance portal.',
    categoryHi: 'जनसूचना (Public Notice)',
    categoryEn: 'Public Notice',
    isNew: false,
  },
];

export const NoticesSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <section id="notices" className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold mb-3">
            <FileText className="w-4 h-4 text-emerald-700" />
            <span>{t.notices.tag}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-poppins">
            {t.notices.title}
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-emerald-600 via-blue-600 to-amber-500 mx-auto rounded-full mt-3 mb-4" />
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-inter max-w-2xl mx-auto">
            {t.notices.subtitle}
          </p>
        </div>

        {/* Notice List */}
        <div className="space-y-3 max-w-5xl mx-auto">
          {NOTICES_DATA.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50 hover:bg-slate-100/80 rounded-xl p-4 sm:p-5 border border-slate-200 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-slate-500 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.refNo}
                  </span>
                  <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {isHi ? item.categoryHi : item.categoryEn}
                  </span>
                  {item.isNew && (
                    <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                      {isHi ? 'नवीन' : 'NEW'}
                    </span>
                  )}
                  <span className="text-slate-400 text-xs flex items-center gap-1 ml-auto sm:ml-0">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.date}</span>
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                  {isHi ? item.titleHi : item.titleEn}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      isHi
                        ? `नोटिस PDF डाउनलोड: ${item.refNo}`
                        : `Downloading Notice PDF: ${item.refNo}`
                    )
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white hover:bg-slate-50 text-[#0b1b36] border border-slate-300 font-semibold px-3.5 py-2 rounded-lg text-xs shadow-xs cursor-pointer"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>{t.common.downloadPdf}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
