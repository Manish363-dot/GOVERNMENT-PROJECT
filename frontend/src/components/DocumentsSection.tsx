import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Scale,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  BookOpen,
  Gavel,
  Eye,
  Info,
  CheckCircle2,
  AlertOctagon,
  Leaf,
  Users,
  Recycle,
  Ban
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type IconType = 'recycle' | 'users' | 'alert' | 'ban' | 'leaf' | 'check';

interface Highlight {
  icon: IconType;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
}

interface BylawDocument {
  id: string;
  pages: string[];
  pdfUrl?: string;
  titleEn: string;
  titleHi: string;
  gazetteEn: string;
  gazetteHi: string;
  dateEn: string;
  dateHi: string;
  issuedByEn: string;
  issuedByHi: string;
  descriptionEn: string;
  descriptionHi: string;
  highlights: Highlight[];
}

const S3_BASE = import.meta.env.VITE_AWS_S3_BUCKET_URL || '';

const BYLAWS: BylawDocument[] = [
  {
    id: 'bylaw-swm-2023',
    pages: [
      `${S3_BASE}/bylaws/Page1.png`,
      `${S3_BASE}/bylaws/Page2.png`,
      `${S3_BASE}/bylaws/Page3.png`,
      `${S3_BASE}/bylaws/Page4.png`,
      `${S3_BASE}/bylaws/Page5.png`,
      `${S3_BASE}/bylaws/Page6.png`,
    ],
    titleEn: 'Rural Solid Waste Management & Cleanliness Bylaw — 2023',
    titleHi: 'ग्रामीण ठोस अपशिष्ट प्रबंधन एवं स्वच्छता उपविधि — 2023',
    gazetteEn: 'Uttarakhand Government Gazette, Part 1-Ka, Section 25, No. 12',
    gazetteHi: 'उत्तराखंड सरकारी गजट, भाग 1-क, खण्ड-25, संख्या-12',
    dateEn: '23 March 2024 (Published)',
    dateHi: '23 मार्च 2024 (प्रकाशित)',
    issuedByEn: 'Zila Panchayat, Almora',
    issuedByHi: 'जिला पंचायत, अल्मोड़ा',
    descriptionEn: 'Framed under Section 106 of the Uttarakhand Panchayatiraj Adhiniyam, 2016 for managing solid waste in all rural areas of Almora district.',
    descriptionHi: 'उत्तराखंड पंचायतीराज अधिनियम, 2016 की धारा 106 के अंतर्गत अल्मोड़ा जनपद के समस्त ग्रामीण क्षेत्रों में ठोस अपशिष्ट प्रबंधन हेतु निर्मित।',
    highlights: [
      {
        icon: 'recycle',
        titleEn: 'Mandatory Segregation',
        titleHi: 'अनिवार्य पृथक्करण',
        descEn: 'Wet, dry, and hazardous waste must be separated at source.',
        descHi: 'गीला, सूखा और खतरनाक कचरा स्रोत पर ही अलग करना अनिवार्य है।'
      },
      {
        icon: 'users',
        titleEn: 'Monthly User Charges',
        titleHi: 'मासिक यूज़र चार्ज',
        descEn: 'Residential: ₹50, Shops: ₹100, Hotels: ₹500-₹2000.',
        descHi: 'आवासीय: ₹50, दुकानें: ₹100, होटल: ₹500-₹2000 प्रति माह।'
      },
      {
        icon: 'alert',
        titleEn: 'Strict Penalties',
        titleHi: 'सख्त जुर्माना',
        descEn: 'Fines up to ₹500/day + 10x multiplied user charges for violations.',
        descHi: 'उल्लंघन पर ₹500/दिन तक जुर्माना + यूज़र चार्ज का 10 गुना अर्थदंड।'
      },
      {
        icon: 'ban',
        titleEn: 'Ban on Open Burning',
        titleHi: 'खुले में जलाने पर रोक',
        descEn: 'Strict prohibition on burning or littering waste on public spaces.',
        descHi: 'सार्वजनिक स्थानों पर कचरा फेंकने या जलाने पर पूर्ण प्रतिबंध।'
      },
      {
        icon: 'leaf',
        titleEn: 'Scientific Disposal',
        titleHi: 'वैज्ञानिक निस्तारण',
        descEn: 'All waste must be composted. Mixed waste landfilling is prohibited.',
        descHi: 'कचरे की कम्पोस्टिंग अनिवार्य है। मिश्रित कचरे का लैंडफिल वर्जित है।'
      }
    ]
  },
  {
    id: 'rules-swm-2026',
    pages: [
      `${S3_BASE}/bylaws/Page7.png`,
      `${S3_BASE}/bylaws/Page8.png`,
      `${S3_BASE}/bylaws/Page9.png`,
      `${S3_BASE}/bylaws/Page10.png`,
      `${S3_BASE}/bylaws/Page11.png`,
      `${S3_BASE}/bylaws/Page12.png`,
    ],
    pdfUrl: `${S3_BASE}/bylaws/solid-waste-management-rules-2026.pdf`,
    titleEn: 'Solid Waste Management Rules, 2026',
    titleHi: 'ठोस अपशिष्ट प्रबंधन नियम, 2026 (प्रारूप)',
    gazetteEn: 'The Gazette of India: Extraordinary, Part II, Sec 3',
    gazetteHi: 'भारत का राजपत्र : असाधारण, भाग II, खण्ड 3',
    dateEn: '28 January 2026 (Published)',
    dateHi: '28 जनवरी 2026 (प्रकाशित)',
    issuedByEn: 'MoEFCC, Govt. of India',
    issuedByHi: 'पर्यावरण, वन और जलवायु परिवर्तन मंत्रालय, भारत सरकार',
    descriptionEn: 'New central guidelines superseding the 2016 rules, emphasizing strict waste segregation, extended responsibilities, and heavy penalties.',
    descriptionHi: '2016 के नियमों का स्थान लेने वाले नए केंद्रीय दिशा-निर्देश। इनमें कचरा पृथक्करण, विस्तारित जिम्मेदारियों और सख्त दंड पर जोर दिया गया है।',
    highlights: [
      {
        icon: 'recycle',
        titleEn: 'Source Segregation',
        titleHi: 'स्रोत पर पृथक्करण',
        descEn: 'Segregate waste into wet, dry, sanitary, and special care streams.',
        descHi: 'कचरे को गीले, सूखे, सैनिटरी और विशेष देखभाल वाले कचरे में अलग करें।'
      },
      {
        icon: 'users',
        titleEn: 'Bulk Waste Generators',
        titleHi: 'थोक अपशिष्ट उत्पादक (BWG)',
        descEn: 'Entities >20,000 sqm or >100 kg/day must process wet waste locally.',
        descHi: '20,000 वर्ग मीटर या 100 किग्रा/दिन से अधिक वाली इकाइयों को स्वयं निस्तारण करना होगा।'
      },
      {
        icon: 'check',
        titleEn: 'Event Protocols',
        titleHi: 'आयोजन के नियम',
        descEn: 'Events with >100 people require 3-day prior intimation to local body.',
        descHi: '100 से अधिक लोगों के आयोजन के लिए स्थानीय निकाय को 3 दिन पहले सूचित करना अनिवार्य।'
      },
      {
        icon: 'alert',
        titleEn: 'Polluter Pays',
        titleHi: 'प्रदूषक भुगतान सिद्धांत',
        descEn: 'Heavy environmental compensation and spot fines for illegal dumping.',
        descHi: 'अवैध डंपिंग और जलाने पर भारी पर्यावरणीय जुर्माना (Environmental Compensation)।'
      },
      {
        icon: 'leaf',
        titleEn: 'Zero Waste to Landfill',
        titleHi: 'लैंडफिल में शून्य कचरा',
        descEn: 'Only non-usable inerts allowed in landfills. Mixed waste is banned.',
        descHi: 'लैंडफिल में केवल निष्क्रिय कचरा (Inerts) जाएगा। मिश्रित कचरा सख्त मना है।'
      }
    ]
  }
];

const getIcon = (type: IconType, className: string) => {
  switch (type) {
    case 'recycle': return <Recycle className={className} />;
    case 'users': return <Users className={className} />;
    case 'alert': return <AlertOctagon className={className} />;
    case 'ban': return <Ban className={className} />;
    case 'leaf': return <Leaf className={className} />;
    case 'check': return <CheckCircle2 className={className} />;
  }
};

export function DocumentsSection() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [activeDocIndex, setActiveDocIndex] = useState(0);
  const doc = BYLAWS[activeDocIndex];

  // Viewer state
  const [viewerDoc, setViewerDoc] = useState<BylawDocument | null>(null);
  const [viewerPage, setViewerPage] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Auto slide state for the current document's pages
  const [slideIndex, setSlideIndex] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset page slide when document changes
  useEffect(() => {
    setSlideIndex(0);
  }, [activeDocIndex]);

  // Page auto-slide
  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % doc.pages.length);
    }, 4000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [doc.pages.length, activeDocIndex]);

  // Viewer scroll lock
  useEffect(() => {
    if (viewerDoc) {
      setZoom(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [viewerDoc]);

  // Viewer keyboard nav
  useEffect(() => {
    if (!viewerDoc) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setViewerPage(p => Math.min(p + 1, viewerDoc.pages.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setViewerPage(p => Math.max(p - 1, 0));
      } else if (e.key === 'Escape') {
        setViewerDoc(null);
      } else if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(z + 0.25, 3));
      } else if (e.key === '-') {
        setZoom(z => Math.max(z - 0.25, 0.5));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [viewerDoc]);

  const nextDoc = () => setActiveDocIndex((p) => (p + 1) % BYLAWS.length);
  const prevDoc = () => setActiveDocIndex((p) => (p - 1 + BYLAWS.length) % BYLAWS.length);
  
  const openViewer = (page: number) => {
    setViewerPage(page);
    setViewerDoc(doc);
  };

  return (
    <section
      id="documents"
      className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-purple-200 text-purple-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-purple-200">
              <Scale className="w-3.5 h-3.5 text-purple-900" />
              <span>{isHi ? 'शासकीय उपविधि एवं नियम' : 'Official Bylaws & Rules'}</span>
            </div>
            <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-bold text-navy-900 leading-tight">
              {isHi ? 'महत्वपूर्ण नियम व दस्तावेज़' : 'Key Provisions & Documents'}
            </h2>
          </div>

          {/* Slider Controls */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={prevDoc}
              className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-1.5 px-2">
              {BYLAWS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveDocIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeDocIndex ? 'w-8 bg-amber-400' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={nextDoc}
              className="w-12 h-12 rounded-full border border-slate-300 flex items-center justify-center text-navy-900 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Content */}
        <div className="relative">
          <div 
            key={doc.id} 
            className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500"
          >
            <div className="flex flex-col lg:flex-row">
              
              {/* Left Panel: Document Viewer */}
              <div className="lg:w-[480px] shrink-0 bg-navy-950 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                  <Gavel className="w-64 h-64 text-white" />
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-amber-300 font-semibold uppercase tracking-wider mb-6 z-10 border border-amber-500/30 px-3 py-1 rounded-full bg-amber-500/10">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{isHi ? (doc.gazetteHi.includes('भारत') ? 'भारत का राजपत्र' : 'उत्तराखंड सरकारी गजट') : (doc.gazetteEn.includes('India') ? 'The Gazette of India' : 'Uttarakhand Government Gazette')}</span>
                </div>

                <div 
                  className="relative w-full max-w-[360px] aspect-[3/4] rounded-xl overflow-hidden border border-navy-700 shadow-2xl bg-white z-10 cursor-pointer group"
                  onClick={() => openViewer(slideIndex)}
                >
                  <img
                    src={doc.pages[slideIndex]}
                    alt={`${isHi ? 'पृष्ठ' : 'Page'} ${slideIndex + 1}`}
                    className="w-full h-full object-cover object-top transition-all duration-700 group-hover:scale-105 bg-white"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-navy-950/0 group-hover:bg-navy-950/40 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2 bg-amber-400 text-navy-900 px-5 py-2.5 rounded-lg text-sm font-bold shadow-lg">
                      <Eye className="w-4 h-4" />
                      <span>{isHi ? 'दस्तावेज़ पढ़ें' : 'Read Document'}</span>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 bg-navy-900/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm backdrop-blur-sm">
                    {slideIndex + 1} / {doc.pages.length}
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-8 z-10">
                  {doc.pages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (autoRef.current) clearInterval(autoRef.current);
                        setSlideIndex(idx);
                      }}
                      className={`w-2.5 h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        slideIndex === idx
                          ? 'bg-amber-400 w-8'
                          : 'bg-navy-700 hover:bg-navy-500'
                      }`}
                      aria-label={`${isHi ? 'पृष्ठ' : 'Page'} ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Right Panel: Content & Highlights */}
              <div className="flex-1 p-6 sm:p-8 lg:p-10 flex flex-col justify-between bg-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                  <Scale className="w-48 h-48 text-navy-900" />
                </div>

                <div>
                  <h3 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 leading-snug mb-3 pr-8">
                    {isHi ? doc.titleHi : doc.titleEn}
                  </h3>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-slate-600 mb-6 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="w-4 h-4 text-navy-600 shrink-0" />
                      {isHi ? doc.gazetteHi : doc.gazetteEn}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-navy-600 shrink-0" />
                      {isHi ? doc.dateHi : doc.dateEn}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-8 max-w-3xl">
                    {isHi ? doc.descriptionHi : doc.descriptionEn}
                  </p>

                  {/* Premium Highlights Grid */}
                  <div>
                    <h4 className="flex items-center gap-2 text-navy-900 font-bold text-base uppercase tracking-wide mb-5">
                      <Info className="text-amber-500 w-5 h-5" />
                      {isHi ? 'प्रमुख बिंदु व नियम' : 'Key Rules & Provisions'}
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {doc.highlights.map((highlight, idx) => (
                        <div 
                          key={idx} 
                          className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-amber-300 hover:shadow-md hover:bg-amber-50/30 transition-all group"
                        >
                          <div className="flex items-start gap-3.5">
                            <div className="w-10 h-10 rounded-lg bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:border-amber-400 transition-colors">
                              {getIcon(highlight.icon, "w-5 h-5 text-navy-700 group-hover:text-navy-950 transition-colors")}
                            </div>
                            <div>
                              <h5 className="font-bold text-navy-900 text-sm mb-1">
                                {isHi ? highlight.titleHi : highlight.titleEn}
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {isHi ? highlight.descHi : highlight.descEn}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium">{isHi ? 'जारीकर्ता: ' : 'Issued by: '}</span>
                    <span className="text-navy-900 font-bold">{isHi ? doc.issuedByHi : doc.issuedByEn}</span>
                  </div>
                  
                  <button
                    onClick={() => openViewer(slideIndex)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-navy-900 text-white hover:bg-navy-800 text-sm font-semibold transition-colors shadow-md hover:shadow-lg cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{isHi ? 'पूरा दस्तावेज़ पढ़ें' : 'Read Full Document'}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Document Viewer Modal */}
      {viewerDoc && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col animate-in fade-in duration-200"
          onClick={() => setViewerDoc(null)}
        >
          {/* Viewer Top Bar */}
          <div
            className="shrink-0 bg-navy-950 border-b border-navy-800 px-4 py-2.5 flex items-center justify-between gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-white text-sm font-semibold truncate">
                {isHi ? viewerDoc.titleHi : viewerDoc.titleEn}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {!viewerDoc.pdfUrl && (
                <>
                  <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                    {isHi ? 'पृष्ठ' : 'Page'} {viewerPage + 1} / {viewerDoc.pages.length}
                  </span>

                  <button
                    onClick={() => setZoom(z => Math.max(z - 0.25, 0.5))}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs text-slate-400 font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button
                    onClick={() => setZoom(z => Math.min(z + 0.25, 3))}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom(1)}
                    className="w-8 h-8 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </>
              )}

              <button
                onClick={() => setViewerDoc(null)}
                className="w-8 h-8 rounded-lg bg-rose-900/70 hover:bg-rose-700 text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Viewer Body */}
          <div
            className={`flex-1 overflow-auto flex ${viewerDoc.pdfUrl ? '' : 'items-start justify-center py-4 px-2'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {viewerDoc.pdfUrl ? (
              <iframe
                src={viewerDoc.pdfUrl}
                className="w-full h-full border-0 bg-white"
                title={viewerDoc.titleEn}
              />
            ) : (
              <img
                src={viewerDoc.pages[viewerPage]}
                alt={`${isHi ? 'पृष्ठ' : 'Page'} ${viewerPage + 1}`}
                className="shadow-2xl rounded-lg border border-navy-700 transition-transform duration-300 select-none bg-white"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', maxWidth: '800px', width: '100%' }}
                draggable={false}
              />
            )}
          </div>

          {/* Viewer Bottom Nav */}
          {!viewerDoc.pdfUrl && (
            <div
              className="shrink-0 bg-navy-950 border-t border-navy-800 px-4 py-2.5 flex items-center justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setViewerPage(p => Math.max(p - 1, 0))}
                disabled={viewerPage === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-navy-800 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{isHi ? 'पिछला' : 'Previous'}</span>
              </button>

              <div className="flex items-center gap-1.5 flex-wrap justify-center px-2">
                {viewerDoc.pages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setViewerPage(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-300 cursor-pointer border ${
                      viewerPage === idx
                        ? 'bg-amber-400 text-navy-950 border-amber-400 shadow-md'
                        : 'bg-navy-800 text-slate-400 border-navy-700 hover:bg-navy-700 hover:text-white'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setViewerPage(p => Math.min(p + 1, viewerDoc.pages.length - 1))}
                disabled={viewerPage === viewerDoc.pages.length - 1}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-navy-800 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">{isHi ? 'अगला' : 'Next'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
