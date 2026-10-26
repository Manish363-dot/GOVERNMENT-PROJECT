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
        {/* Breadcrumb */}
        <nav className="text-xs sm:text-sm text-slate-500 mb-6 flex items-center gap-1.5" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-[#1a365d] hover:underline">
            {isHi ? 'मुख्य पृष्ठ' : 'Home'}
          </Link>
          <span className="text-slate-400">&gt;</span>
          <span className="text-slate-700 font-medium">
            {isHi ? 'साइट मैप' : 'Site Map'}
          </span>
        </nav>

        {/* Main Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#1a365d] mb-4">
          {isHi ? 'साइट मैप' : 'Site Map'}
        </h1>

        {/* ── Primary menu Heading ── */}
        <h2 className="text-base sm:text-lg font-bold text-[#1a365d] mb-4 pb-1 border-b border-slate-200">
          {isHi ? 'प्राथमिक मेनू' : 'Primary menu'}
        </h2>

        {/* ── Tree Structure: Primary Menu ── */}
        <div className="space-y-4 text-xs sm:text-sm text-[#1a365d] leading-relaxed pl-1">

          {/* 1. Home */}
          <div>
            <Link to="/" className="font-bold hover:underline flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'मुख्य पृष्ठ' : 'Home'}</span>
            </Link>
          </div>

          {/* 2. About us */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'हमारे बारे में' : 'About us'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/our-initiative" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'हमारी पहल' : 'Our Initiative'}</span>
                </Link>
              </div>
              <div>
                <Link to="/vision-mission" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'विज़न और मिशन' : 'Vision & Mission'}</span>
                </Link>
              </div>
              <div>
                <Link to="/staff-directory" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'अधिकारी एवं कर्मचारी विवरण' : 'Staff Directory'}</span>
                </Link>
              </div>
              <div>
                <Link to="/blocks" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'जनपद के 11 विकासखंड' : '11 District Blocks'}</span>
                </Link>
              </div>
              <div>
                <a href="/#about" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'हमारे बारे में अनुभाग' : 'About Us Section'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 3. Grievance / Complaint */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'नागरिक शिकायत पोर्टल' : 'Public Grievance'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/complaint/register" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'शिकायत दर्ज करें' : 'Do Complaint'}</span>
                </Link>
              </div>
              <div>
                <Link to="/complaint/track" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'शिकायत ट्रैक करें' : 'Track Complaint'}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4. Swachhata Pledge */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'स्वच्छता शपथ' : 'Swachhata Pledge'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/pledge" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'स्वच्छता शपथ लें एवं ई-सर्टिफिकेट पाएं' : 'Take Pledge & Download Certificate'}</span>
                </Link>
              </div>
              <div>
                <a href="/#pledge" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'शपथ अनुभाग (होम पेज)' : 'Pledge Section (Home)'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 5. Waste Segregation */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'अपशिष्ट पृथक्करण प्रोटोकॉल' : 'Waste Segregation'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/waste-protocol" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? '4-डस्टबिन पृथक्करण नियम' : '4-Dustbin Protocol (Wet, Dry, Hazardous, Sanitary)'}</span>
                </Link>
              </div>
              <div>
                <a href="/#waste-protocol" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'कचरा पृथक्करण अनुभाग (होम पेज)' : 'Waste Protocol Section (Home)'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 6. Documents & Bylaws */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'शासकीय उपविधि एवं नियम' : 'Bylaws & Rules'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/cleanliness-bylaws" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'स्वच्छता उपविधियाँ (2023)' : 'Cleanliness Bylaws 2023'}</span>
                </Link>
              </div>
              <div>
                <Link to="/swm-rules-2026" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'ठोस अपशिष्ट प्रबंधन नियम (2026)' : 'Solid Waste Management Rules 2026'}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 7. Notices & Updates */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'सूचनाएं एवं अपडेट' : 'Notices & Updates'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/notices" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'नवीनतम सूचनाएं एवं आदेश' : 'Latest Notices & Circulars'}</span>
                </Link>
              </div>
              <div>
                <a href="/#Notices" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'सूचना पट्ट अनुभाग (होम पेज)' : 'Notices Section (Home)'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 8. Daily Work / Blogs */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'दैनिक कार्य' : 'Daily Work'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/daily-work" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'दैनिक कार्य एवं फोटो गैलरी' : 'Daily Work & Photo Gallery'}</span>
                </Link>
              </div>
              <div>
                <a href="/#blogs" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'दैनिक कार्य अनुभाग (होम पेज)' : 'Daily Work Section (Home)'}</span>
                </a>
              </div>
            </div>
          </div>

          {/* 9. Contact Us */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'संपर्क करें' : 'Contact Us'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/contact" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'संपर्क पृष्ठ (धारानौला, अल्मोड़ा)' : 'Contact Office (Dharanaula, Almora)'}</span>
                </Link>
              </div>
              <div>
                <Link to="/contact" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'टोल-फ्री हेल्पलाइन: 1800-185-1850' : 'Toll-Free Helpline: 1800-185-1850'}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 10. Dashboard & Admin */}
          <div className="space-y-2">
            <div className="font-bold flex items-center gap-2">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'डैशबोर्ड (अधिकारी लॉगिन)' : 'Dashboard (Officer Access)'}</span>
            </div>
            <div className="pl-6 space-y-2">
              <div>
                <Link to="/signin" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'लॉगिन करें (Sign In)' : 'Sign In / Login'}</span>
                </Link>
              </div>
              <div>
                <Link to="/signup" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'पंजीकरण करें (Sign Up)' : 'Sign Up / Register'}</span>
                </Link>
              </div>
              <div>
                <Link to="/forgot-password" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'पासवर्ड भूल गए (Forgot Password)' : 'Forgot Password'}</span>
                </Link>
              </div>
              <div>
                <Link to="/dashboard" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'डैशबोर्ड अवलोकन (Overview)' : 'Dashboard Overview'}</span>
                </Link>
              </div>
              <div>
                <Link to="/dashboard/tracking" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'लाइव ट्रैकिंग (Live Tracking)' : 'Live Tracking'}</span>
                </Link>
              </div>
              <div>
                <Link to="/dashboard/history" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'वाहन इतिहास व रूट रीप्ले (Vehicle History & Replay)' : 'Vehicle History & Route Replay'}</span>
                </Link>
              </div>
              <div>
                <Link to="/dashboard/complaints" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'सार्वजनिक शिकायतें (Complaints)' : 'Public Grievances'}</span>
                </Link>
              </div>
              <div>
                <Link to="/dashboard/vehicles" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'वाहन सूची (Vehicles)' : 'Vehicles'}</span>
                </Link>
              </div>
              <div>
                <Link to="/dashboard/media" className="hover:underline flex items-center gap-2">
                  <span className="text-slate-500 text-[11px]">◇</span>
                  <span>{isHi ? 'मीडिया और दैनिक कार्य (Media & Daily Work)' : 'Media & Daily Work'}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer Menu Heading ── */}
        <h2 className="text-base sm:text-lg font-bold text-[#1a365d] mt-10 mb-4 pb-1 border-b border-slate-200">
          {isHi ? 'फुटर मेनू' : 'Footer Menu'}
        </h2>

        {/* ── Tree Structure: Footer Menu ── */}
        <div className="space-y-2.5 text-xs sm:text-sm text-[#1a365d] leading-relaxed pl-1">
          <div>
            <Link to="/about-website" className="hover:underline flex items-center gap-2 font-medium">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'इस वेबसाइट के बारे में' : 'About This website'}</span>
            </Link>
          </div>
          <div>
            <Link to="/terms-of-use" className="hover:underline flex items-center gap-2 font-medium">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'उपयोग की शर्तें' : 'Terms of Use'}</span>
            </Link>
          </div>
          <div>
            <Link to="/website-policy" className="hover:underline flex items-center gap-2 font-medium">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'वेबसाइट नीतियां' : 'Website Policies'}</span>
            </Link>
          </div>
          <div>
            <Link to="/sitemap" className="hover:underline flex items-center gap-2 font-medium">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'साइट मैप' : 'Site map'}</span>
            </Link>
          </div>
          <div>
            <Link to="/contact" className="hover:underline flex items-center gap-2 font-medium">
              <span className="text-[#1a365d] font-black">&gt;</span>
              <span>{isHi ? 'संपर्क करें' : 'Contact Us'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SiteMapPage;
