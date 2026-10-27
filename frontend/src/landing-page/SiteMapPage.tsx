import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function SiteMapPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Main Title */}
        <div className="mb-8 pb-3 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1a365d] tracking-tight">
            {isHi ? 'साइट मैप' : 'Site Map'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isHi 
              ? 'पोर्टल के सभी पृष्ठों, अनुभागों और सेवाओं की पदानुक्रमित सूची' 
              : 'Hierarchical directory of all pages, sections, and services on the portal'}
          </p>
        </div>

        {/* ── Tree Structure: Primary Menu ── */}
        <div className="space-y-6 text-xs sm:text-sm text-[#1a365d] leading-relaxed pl-1">

          {/* 1. Home */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'मुख्य पृष्ठ' : 'Home'}
            </Link>
          </div>

          {/* 2. About us */}
          <div className="space-y-1">
            <div className="font-bold text-base flex items-center gap-2">
              <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
              <span>{isHi ? 'हमारे बारे में' : 'About us'}</span>
            </div>
            
            {/* Level 2 Branch */}
            <div className="border-l-2 border-slate-300 ml-2.5 pl-4 py-1 space-y-2.5">
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/#about-zp" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'परिचय - जिला पंचायत अल्मोड़ा' : 'About - ZilaPanchayatAlmora'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/our-initiative" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'हमारी पहल' : 'Our Initiative'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/vision-mission" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'विज़न और मिशन' : 'Vision & Mission'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/staff-directory" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff Directory'}
                </Link>
              </div>
            </div>
          </div>

          {/* 3. Services & Portals */}
          <div className="space-y-1">
            <div className="font-bold text-base flex items-center gap-2">
              <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
              <span>{isHi ? 'सेवाएँ एवं पोर्टल' : 'Services & Portals'}</span>
            </div>

            {/* Level 2 Branch */}
            <div className="border-l-2 border-slate-300 ml-2.5 pl-4 py-1 space-y-3">
              
              {/* SWM Portal Node */}
              <div>
                <div className="relative flex items-center gap-2 group">
                  <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                  <span className="text-emerald-700 text-[12px] font-bold select-none">◇</span>
                  <Link to="/safai-portal" className="hover:underline hover:text-blue-800 font-bold text-sm">
                    {isHi ? 'स्वच्छता एवं ठोस अपशिष्ट प्रबंधन पोर्टल' : 'SWM Portal'}
                  </Link>
                </div>

                {/* Level 3 Deep Branch under SWM Portal */}
                <div className="border-l-2 border-emerald-300 ml-3 pl-4 py-1.5 space-y-2 mt-1.5">
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/safai-portal#about" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'ठोस अपशिष्ट प्रबंध - परिचय' : 'About - Solid Waste Management'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/safai-portal#Livequotes" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'प्रेरणादायक विचार' : 'Inspirational Quotes'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/safai-portal#waste-protocol" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'कचरा स्रोत पृथक्करण प्रणाली' : 'Waste Source Segregation Protocol'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/safai-portal#pledge" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'स्वच्छता शपथ' : 'Swachhata Pledge'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/cleanliness-bylaws" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'स्वच्छता उपविधियाँ (2023)' : 'Cleanliness Bylaws 2023'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/swm-rules-2026" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'ठोस अपशिष्ट प्रबंधन नियम (2026)' : 'Solid Waste Management Rules 2026'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/complaint/register" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}
                    </Link>
                  </div>
                  <div className="relative flex items-center gap-2 group">
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-emerald-300" />
                    <span className="text-slate-400 text-[11px] select-none">•</span>
                    <Link to="/complaint/track" className="hover:underline hover:text-blue-800 transition-colors">
                      {isHi ? 'शिकायत ट्रैक करें' : 'Track Complaint'}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Rental Management Portal Node */}
              <div className="relative flex items-center gap-2 group pt-1">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-amber-600 text-[12px] font-bold select-none">◇</span>
                <Link to="/rental-portal" className="hover:underline hover:text-blue-800 font-bold text-sm inline-flex items-center gap-2">
                  <span>{isHi ? 'किराया प्रबंधन पोर्टल' : 'Rental Management Portal'}</span>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold border border-amber-200">
                    {isHi ? 'जल्द आ रहा है' : 'COMING SOON'}
                  </span>
                </Link>
              </div>

            </div>
          </div>

          {/* 4. 11 Blocks */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/blocks" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? '11 विकासखंड' : '11 Blocks'}
            </Link>
          </div>

          {/* 5. Our Media */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/media" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'हमारा मीडिया' : 'Our Media'}
            </Link>
          </div>

          {/* 6. Digital Portals */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/#services-hub" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'डिजिटल पोर्टल' : 'Digital Portals'}
            </Link>
          </div>

          {/* 7. Latest Notifications */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/#updates" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'नवीनतम सूचनाएं' : 'Latest Notifications'}
            </Link>
          </div>

          {/* 8. Notices & Updates */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/#Notices" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'सूचनाएं, आदेश एवं अपडेट' : 'Government Notice & Updates'}
            </Link>
          </div>

          {/* 9. Daily Work */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/daily-work" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'दैनिक कार्य' : 'Daily Operations'}
            </Link>
          </div>

          {/* 10. Contact Us */}
          <div className="flex items-center gap-2 group">
            <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
            <Link to="/contact" className="font-bold text-base hover:underline hover:text-blue-800 transition-colors">
              {isHi ? 'संपर्क करें' : 'Contact Us'}
            </Link>
          </div>

          {/* 11. Dashboard & Admin */}
          <div className="space-y-1">
            <div className="font-bold text-base flex items-center gap-2">
              <span className="text-[#1a365d] font-black text-sm select-none">&gt;</span>
              <span>{isHi ? 'डैशबोर्ड (अधिकारी लॉगिन)' : 'Dashboard (Officer Access)'}</span>
            </div>

            {/* Level 2 Branch */}
            <div className="border-l-2 border-slate-300 ml-2.5 pl-4 py-1 space-y-2.5">
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/signin" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'लॉगिन करें' : 'Sign In / Login'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/signup" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'पंजीकरण करें' : 'Sign Up / Register'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/forgot-password" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'पासवर्ड भूल गए' : 'Forgot Password'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/dashboard" className="hover:underline hover:text-blue-800 transition-colors font-medium">
                  {isHi ? 'डैशबोर्ड अवलोकन' : 'Dashboard Overview'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/dashboard/tracking" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'लाइव ट्रैकिंग' : 'Live Tracking'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/dashboard/history" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'वाहन इतिहास व रूट रीप्ले' : 'Vehicle History & Route Replay'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/dashboard/complaints" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'सार्वजनिक शिकायतें' : 'Public Grievances'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/dashboard/vehicles" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'वाहन सूची' : 'Vehicles'}
                </Link>
              </div>
              <div className="relative flex items-center gap-2 group">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
                <span className="text-slate-400 text-[11px] select-none">◇</span>
                <Link to="/dashboard/media" className="hover:underline hover:text-blue-800 transition-colors">
                  {isHi ? 'मीडिया और दैनिक कार्य' : 'Media & Daily Work'}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Menu Heading ── */}
        <div className="mt-12 mb-4 pb-2 border-b border-slate-200">
          <h2 className="text-lg sm:text-xl font-bold text-[#1a365d]">
            {isHi ? 'फुटर मेनू' : 'Footer Menu'}
          </h2>
        </div>

        {/* ── Tree Structure: Footer Menu ── */}
        <div className="border-l-2 border-slate-300 ml-2.5 pl-4 py-1 space-y-2.5 text-xs sm:text-sm text-[#1a365d] leading-relaxed">
          <div className="relative flex items-center gap-2 group">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
            <span className="text-[#1a365d] font-black text-xs select-none">&gt;</span>
            <Link to="/about-website" className="hover:underline hover:text-blue-800 font-medium">
              {isHi ? 'इस वेबसाइट के बारे में' : 'About This website'}
            </Link>
          </div>
          <div className="relative flex items-center gap-2 group">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
            <span className="text-[#1a365d] font-black text-xs select-none">&gt;</span>
            <Link to="/terms-of-use" className="hover:underline hover:text-blue-800 font-medium">
              {isHi ? 'उपयोग की शर्तें' : 'Terms of Use'}
            </Link>
          </div>
          <div className="relative flex items-center gap-2 group">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
            <span className="text-[#1a365d] font-black text-xs select-none">&gt;</span>
            <Link to="/website-policy" className="hover:underline hover:text-blue-800 font-medium">
              {isHi ? 'वेबसाइट नीतियां' : 'Website Policies'}
            </Link>
          </div>
          <div className="relative flex items-center gap-2 group">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
            <span className="text-[#1a365d] font-black text-xs select-none">&gt;</span>
            <Link to="/sitemap" className="hover:underline hover:text-blue-800 font-medium">
              {isHi ? 'साइट मैप' : 'Site map'}
            </Link>
          </div>
          <div className="relative flex items-center gap-2 group">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-3 h-[1.5px] bg-slate-300" />
            <span className="text-[#1a365d] font-black text-xs select-none">&gt;</span>
            <Link to="/contact" className="hover:underline hover:text-blue-800 font-medium">
              {isHi ? 'संपर्क करें' : 'Contact Us'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteMapPage;
