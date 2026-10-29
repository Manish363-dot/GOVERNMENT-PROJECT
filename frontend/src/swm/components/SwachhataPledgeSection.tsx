import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Download,
  RefreshCw
} from 'lucide-react';
import { usePledgeCount } from '@/hooks/usePledgeCount';

const S3_BUCKET = import.meta.env.VITE_AWS_S3_BUCKET_URL;
const PLEDGE_LOGO_S3_URL = `${S3_BUCKET}/portal-logos/logo2.webp`;
const FALLBACK_LOGO_URL =  `${S3_BUCKET}/portal-logos/logo2.webp`;

export const SwachhataPledgeSection = React.memo(() => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const {count , increment } = usePledgeCount();

  const [citizenName, setCitizenName] = useState('');
  const [gramPanchayat, setGramPanchayat] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [agreedToPledge, setAgreedToPledge] = useState(false);
  const [pledgeTaken, setPledgeTaken] = useState(false);
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [certificateId, setCertificateId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const certRef = useRef<HTMLDivElement>(null);

  const handleTakePledge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenName.trim()) return;

    setIsGenerating(true);
    setHasDownloaded(false);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `ZPA-SBMG-${new Date().getFullYear()}-${randomNum}`;
    setCertificateId(newId);

    setTimeout(() => {
      setIsGenerating(false);
      setPledgeTaken(true);
      setTimeout(() => {
        certRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }, 300);
  };

  const loadImage = (src: string): Promise<HTMLImageElement | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = src;
    });
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setIsDownloading(false);
      return;
    }

    canvas.width = 1200;
    canvas.height = 800;

    // Preload logo from AWS S3 (with fallback to local)
    let imgPanchayat = await loadImage(PLEDGE_LOGO_S3_URL);
    if (!imgPanchayat) {
      imgPanchayat = await loadImage(FALLBACK_LOGO_URL);
    }

    // 1. Background gradient & frame
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 800);
    bgGradient.addColorStop(0, '#061021');
    bgGradient.addColorStop(0.5, '#0b192e');
    bgGradient.addColorStop(1, '#061021');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 800);

    // 2. Ornate gold border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 6;
    ctx.strokeRect(30, 30, 1140, 740);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(40, 40, 1120, 720);

    // 3. Tricolor top accent stripe
    const barWidth = 1120 / 3;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(40, 40, barWidth, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40 + barWidth, 40, barWidth, 6);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(40 + barWidth * 2, 40, barWidth, 6);

    // 4. Draw Panchayati Raj Logo & Header Text together in One Line (Centered with clean padding)
    const titleText = 'जिला पंचायत अल्मोड़ा';
    const subText = 'स्वच्छ भारत मिशन (ग्रामीण)';

    ctx.font = 'bold 24px sans-serif';
    const titleWidth = ctx.measureText(titleText).width;
    ctx.font = '600 14px sans-serif';
    const subWidth = ctx.measureText(subText).width;
    const textBlockWidth = Math.max(titleWidth, subWidth);

    const logoRadius = 36;
    const logoDiameter = logoRadius * 2;
    const logoImgSize = 56;
    const gap = 18;
    const totalHeaderWidth = logoDiameter + gap + textBlockWidth;
    const startX = 600 - (totalHeaderWidth / 2);
    const logoCenterX = startX + logoRadius;
    const centerY = 112; // Placed comfortably below the top tricolor border (46px)

    if (imgPanchayat) {
      ctx.save();
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // White circular badge
      ctx.beginPath();
      ctx.arc(logoCenterX, centerY, logoRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 3.5;
      ctx.stroke();

      // Sharp centered Panchayati Raj logo inside circle
      ctx.drawImage(
        imgPanchayat,
        logoCenterX - (logoImgSize / 2),
        centerY - (logoImgSize / 2),
        logoImgSize,
        logoImgSize
      );
      ctx.restore();
    }

    // 5. Header Text (in one line with logo, vertically centered)
    const textStartX = startX + logoDiameter + gap;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(titleText, textStartX, centerY - 14);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 14px sans-serif';
    ctx.fillText(subText, textStartX, centerY + 14);

    // CRITICAL: Reset baseline and alignment to CENTER for the certificate body
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Georgia, serif';
    ctx.fillText('CERTIFICATE OF SWACHHATA PLEDGE', 600, 195);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 18px sans-serif';
    ctx.fillText('This certificate is proudly awarded to', 600, 240);

    // 7. Citizen Name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 44px Georgia, serif';
    ctx.fillText(citizenName.toUpperCase(), 600, 305);

    // Underline for name
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(350, 322);
    ctx.lineTo(850, 322);
    ctx.stroke();

    // Locality
    if (gramPanchayat) {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(`Resident of: ${gramPanchayat}, District Almora (Uttarakhand)`, 600, 355);
    }

    // 8. Citation Body (Centered)
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '16px sans-serif';
    ctx.fillText(
      'In recognition of your solemn commitment to preserve the pristine ecology, rivers, and scenic valleys',
      600,
      400
    );
    ctx.fillText(
      'of District Almora by practicing waste segregation at source, eliminating single-use plastics, and',
      600,
      430
    );
    ctx.fillText(
      'actively participating in building a Clean, Green & Sustainable Devbhoomi.',
      600,
      460
    );

    // 9. Unique Certificate ID & Date
    const today = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Certificate ID: ${certificateId}`, 80, 520);
    ctx.fillText(`Date of Issuance: ${today}`, 80, 545);

    // 10. Official Demo Signatures & Titles
    ctx.textAlign = 'center';

    // Signature 1: Chairperson (Demo cursive signature)
    ctx.save();
    ctx.font = 'italic 34px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive, serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('Deepa Arya', 320, 630);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(250, 638);
    ctx.bezierCurveTo(290, 644, 350, 632, 390, 640);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('अध्यक्ष / Chairperson', 320, 670);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('जिला पंचायत, अल्मोड़ा', 320, 695);

    // Signature 2: CDO (Demo cursive signature)
    ctx.save();
    ctx.font = 'italic 34px "Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive, serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('A. Verma', 880, 630);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(815, 638);
    ctx.bezierCurveTo(855, 644, 915, 632, 945, 640);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('मुख्य विकास अधिकारी / CDO', 880, 670);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('जिला प्रशासन, अल्मोड़ा', 880, 695);

    // Trigger download
    const link = document.createElement('a');
    link.download = `Swachhata-Pledge-${citizenName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Increment real-time pledge count
    try {
      await increment();
    } catch (err) {
      console.error('[SwachhataPledge] Increment failed:', err);
    }

    // Refresh page so real-time count updates everywhere
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `मैंने जिला पंचायत अल्मोड़ा के स्वच्छ भारत मिशन (ग्रामीण) के अंतर्गत 'स्वच्छता संकल्प शपथ' ली है! 🌱🏔️\n\nआइए हम सब मिलकर देवभूमि अल्मोड़ा को स्वच्छ और प्लास्टिक-मुक्त बनाएं।\nआप भी अपनी शपथ लें: ${window.location.origin}/#pledge`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <section id="pledge" className="py-12 sm:py-20 bg-white border-b border-slate-200 scroll-mt-20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-left max-w-3xl mb-10 sm:mb-14">
          <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-900 tracking-tight leading-tight">
            {isHi ? 'स्वच्छता शपथ लें एवं ई-सर्टिफिकेट पाएं' : 'Take Swachhata Pledge & Get Certificate'}
          </h2>
          <div className="h-1 w-20 bg-emerald-400 rounded-full mt-3 mb-6" />
        </div>

        {/* 2-Column Grid: Form & Live Certificate Preview */}
        <div className="grid lg:grid-cols-12 gap-6 sm:gap-8 items-start">

          {/* Form Column (5 Cols) */}
          <div className="lg:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-navy-900">
                {isHi ? 'शपथ पत्र प्रविष्टि (Pledge Form)' : 'Citizen Pledge Registration'}
              </h3>
            </div>

            <form onSubmit={handleTakePledge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {isHi ? 'नागरिक का पूरा नाम *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isHi ? 'अपना नाम दर्ज करें (उदा. मनीष जोशी)' : 'Enter your name (e.g., Manish Joshi)'}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {isHi ? 'ग्राम पंचायत / वार्ड / ब्लॉक' : 'Gram Panchayat / Ward / Block'}
                </label>
                <input
                  type="text"
                  placeholder={isHi ? 'उदा. हवालबाग / द्वाराहाट' : 'e.g., Hawalbagh / Dwarahat'}
                  value={gramPanchayat}
                  onChange={(e) => setGramPanchayat(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  {isHi ? 'मोबाइल नंबर (वैकल्पिक)' : 'Mobile Number (Optional)'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98XXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                />
              </div>

              {/* Oath Box */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 leading-relaxed space-y-1.5">
                <span className="font-bold block text-amber-900">
                  {isHi ? '📜 शपथ संकल्प (Solemn Oath):' : '📜 Solemn Swachhata Oath:'}
                </span>
                <p className="italic">
                  {isHi
                    ? '"मैं सत्यनिष्ठा से शपथ लेता/लेती हूँ कि मैं अल्मोड़ा की पवित्र देवभूमि, नदियों और अपने परिवेश को स्वच्छ रखने के लिए सदैव तत्पर रहूँगा। मैं कचरे का स्रोत पर 4 रंगों में पृथक्करण करूंगा, सिंगल-यूज़ प्लास्टिक का उपयोग नहीं करूंगा और अन्य नागरिकों को भी स्वच्छता हेतु प्रेरित करूंगा।"'
                    : '"I solemnly pledge to keep Almora pristine, green, and clean. I will segregate waste at source in 4 bins, avoid single-use plastics, and encourage fellow citizens to maintain community hygiene."'}
                </p>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreePledge"
                  checked={agreedToPledge}
                  onChange={(e) => setAgreedToPledge(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="agreePledge" className="text-xs text-slate-600 cursor-pointer">
                  {isHi
                    ? 'मैं उपर्युक्त स्वच्छता संकल्प से पूर्णतः सहमत हूँ और इसका निष्ठापूर्वक पालन करूँगा।'
                    : 'I agree to the Swachhata pledge and commit to upholding cleanliness in my daily life.'}
                </label>
              </div>

              <button
                type="submit"
                disabled={!agreedToPledge || !citizenName.trim() || isGenerating}
                className="w-full py-3 px-4 rounded-xl bg-navy-900 hover:bg-navy-800 disabled:opacity-50 text-amber-400 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                    <span>{isHi ? 'सर्टिफिकेट तैयार हो रहा है...' : 'Generating Certificate...'}</span>
                  </>
                ) : (
                  <>
                    <span>{isHi ? 'शपथ लें एवं ई-सर्टिफिकेट पाएं' : 'Take Pledge & Get Certificate'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Certificate Preview Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            <div
              ref={certRef}
              className="w-full bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 text-white rounded-2xl border-4 border-amber-500/80 p-5 sm:p-7 shadow-xl relative overflow-hidden"
            >
              {/* Subtle background texture */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

              {/* Tricolor top header */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600" />

              <div className="relative z-10 text-center">

                {/* ── Official Centered Panchayati Raj Logo & Heading in One Line ── */}
                <div className="flex items-center justify-center gap-3 sm:gap-4.5 mb-5 pb-4 border-b border-slate-700/60">
                  {/* Round White Background Logo */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-2 shadow-xl border-2 border-amber-400 flex items-center justify-center shrink-0">
                    <img
                      src={PLEDGE_LOGO_S3_URL}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_LOGO_URL;
                      }}
                      alt={isHi ? 'पंचायती राज लोगो' : 'Panchayati Raj Logo'}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Heading Beside Logo in One Line */}
                  <div className="text-left">
                    <p className="text-amber-400 font-extrabold text-sm sm:text-base md:text-lg uppercase tracking-wide leading-tight">
                      {isHi ? 'जिला पंचायत अल्मोड़ा' : 'ZILA PANCHAYAT ALMORA'}
                    </p>
                    <span className="text-[11px] sm:text-xs text-slate-300 uppercase tracking-wider block mt-0.5 font-medium">
                      {isHi ? 'स्वच्छ भारत मिशन (ग्रामीण)' : 'Swachh Bharat Mission (Grameen)'}
                    </span>
                  </div>
                </div>

                {/* Certificate Title */}
                <h3 className="font-serif text-lg sm:text-2xl lg:text-3xl font-extrabold text-white tracking-wide mb-1">
                  {isHi ? 'स्वच्छता संकल्प प्रमाणपत्र' : 'CERTIFICATE OF SWACHHATA PLEDGE'}
                </h3>
                <p className="text-slate-400 text-xs italic mb-3">
                  {isHi ? 'यह प्रमाणपत्र गर्वपूर्वक प्रदान किया जाता है' : 'This certificate is proudly awarded to'}
                </p>

                {/* Citizen Name on Certificate */}
                <div className="py-2 px-4 sm:px-6 my-2 inline-block border-b-2 border-amber-400 max-w-full w-full">
                  <span className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold text-amber-300 break-words block text-center">
                    {citizenName ? citizenName.toUpperCase() : 'YOUR NAME HERE'}
                  </span>
                </div>

                {gramPanchayat && (
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {isHi ? `निवासी: ${gramPanchayat}, अल्मोड़ा (उत्तराखंड)` : `Resident of: ${gramPanchayat}, Almora (Uttarakhand)`}
                  </p>
                )}

                {/* Body Citation */}
                <p className="text-slate-300 text-xs sm:text-sm mt-3.5 leading-relaxed max-w-xl mx-auto">
                  {isHi
                    ? 'अल्मोड़ा की प्राकृतिक वादियों, देवभूमि की नदियों एवं ग्रामीण अंचलों को स्वच्छ रखने, 4-कलर स्रोत पृथक्करण करने एवं पर्यावरण संरक्षण के प्रति आपके पावन संकल्प के सम्मान में।'
                    : 'In recognition of your dedicated commitment to protect the Himalayan ecology, segregate waste at source in 4 bins, and actively participate in Swachh Bharat Mission (Grameen).'}
                </p>

                {/* Certificate Meta */}
                <div className="mt-5 pt-3 border-t border-slate-700/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
                  <span>ID: {certificateId || 'ZPA-SBMG-2026-XXXX'}</span>
                  <span>
                    {isHi ? 'जारी तिथि:' : 'Date:'} {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {/* Digital Signatures */}
                <div className="mt-5 pt-3 grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    {/* Demo Signature 1 */}
                    <div className="h-9 flex flex-col items-center justify-center">
                      <span className="font-serif italic text-base sm:text-lg text-sky-400 font-semibold tracking-wider select-none -rotate-2">
                        Deepa Arya
                      </span>
                      <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent -mt-0.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      {isHi ? 'अध्यक्ष' : 'Chairperson'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isHi ? 'जिला पंचायत, अल्मोड़ा' : 'Zila Panchayat Almora'}
                    </p>
                  </div>

                  <div className="flex flex-col items-center">
                    {/* Demo Signature 2 */}
                    <div className="h-9 flex flex-col items-center justify-center">
                      <span className="font-serif italic text-base sm:text-lg text-sky-400 font-semibold tracking-wider select-none -rotate-1">
                        A. Verma
                      </span>
                      <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-sky-400/70 to-transparent -mt-0.5" />
                    </div>
                    <p className="text-xs font-bold text-slate-200 mt-1">
                      {isHi ? 'मुख्य विकास अधिकारी (CDO)' : 'Chief Development Officer'}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {isHi ? 'जिला प्रशासन, अल्मोड़ा' : 'District Administration'}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Action Buttons if Pledge Taken */}
            {pledgeTaken && (
              <div className="w-full mt-4 flex flex-col items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-80 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {isDownloading ? (
                    <>
                      <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                      <span>{isHi ? 'डाउनलोड हो रहा है एवं पेज रीलोड हो रहा है...' : 'Downloading & Refreshing...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4.5 h-4.5" />
                      <span>{isHi ? 'सर्टिफिकेट डाउनलोड करें (PNG)' : 'Download Certificate (PNG)'}</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
});
