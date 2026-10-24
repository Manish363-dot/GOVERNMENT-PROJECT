import React from 'react';
import { FileText, Download, CheckCircle2, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface DocItem {
  id: string;
  titleHi: string;
  titleEn: string;
  descHi: string;
  descEn: string;
  fileSize: string;
}

const DOCUMENTS: DocItem[] = [
  {
    id: 'DOC-01',
    titleHi: 'दुकान एवं संपत्ति आवंटन नियमावली (2026)',
    titleEn: 'Shop & Property Allotment Bylaws (2026)',
    descHi: 'उत्तराखंड पंचायती राज अधिनियम के तहत दुकानों के आवंटन, नवीनीकरण एवं किराया निर्धारण की आधिकारिक नियमावली।',
    descEn: 'Official regulations for allotment, lease renewal, and rent fixation under Uttarakhand Panchayati Raj Act.',
    fileSize: '1.4 MB',
  },
  {
    id: 'DOC-02',
    titleHi: 'किरायेदार शपथ-पत्र एवं अनुबंध प्रारूप',
    titleEn: 'Tenant Affidavit & Lease Agreement Template',
    descHi: 'आवंटी द्वारा उप-किरायेदारी (Subletting) न करने एवं समय पर किराया भुगतान करने संबंधी मानक शपथ-पत्र प्रारूप।',
    descEn: 'Standard affidavit format undertaking non-subletting and timely payment obligations.',
    fileSize: '450 KB',
  },
  {
    id: 'DOC-03',
    titleHi: 'सामुदायिक भवन एवं बारात घर बुकिंग दिशा-निर्देश',
    titleEn: 'Community Hall & Banquet Venue Booking Rules',
    descHi: 'सार्वजनिक एवं सामाजिक आयोजनों हेतु जिला पंचायत भवनों के आरक्षण, सुरक्षा शुल्क एवं उपयोग नियम।',
    descEn: 'Security deposit, usage terms, and reservation guidelines for Zila Panchayat community venues.',
    fileSize: '820 KB',
  },
];

export const DocumentsSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <section id="documents" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider bg-blue-100/70 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
            {t.documents.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1b36] tracking-tight">
            {t.documents.title}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t.documents.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {DOCUMENTS.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0b1b36] flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-blue-800" />
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">
                  {isHi ? doc.titleHi : doc.titleEn}
                </h3>
                <p className="text-slate-600 text-xs leading-relaxed mb-4">
                  {isHi ? doc.descHi : doc.descEn}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono font-medium">
                  PDF • {doc.fileSize}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    alert(
                      isHi
                        ? `दस्तावेज़ डाउनलोड: ${doc.titleHi}`
                        : `Downloading Document: ${doc.titleEn}`
                    )
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1d4ed8] hover:text-[#1e40af] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.documents.downloadBtn}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
