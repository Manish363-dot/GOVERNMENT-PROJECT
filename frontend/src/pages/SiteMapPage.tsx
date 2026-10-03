import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function SiteMapPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const publicLinks = [
    { nameEn: 'Home', nameHi: 'मुख्य पृष्ठ', path: '/' },
    { nameEn: 'Sign In / Login', nameHi: 'लॉगिन करें', path: '/signin' },
    { nameEn: 'Sign Up / Register', nameHi: 'पंजीकरण करें', path: '/signup' },
    { nameEn: 'Forgot Password', nameHi: 'पासवर्ड भूल गए', path: '/forgot-password' },
    { nameEn: 'About This Website', nameHi: 'इस वेबसाइट के बारे में', path: '/about-website' },
    { nameEn: 'Terms of Use', nameHi: 'उपयोग की शर्तें', path: '/terms-of-use' },
    { nameEn: 'Website Policy', nameHi: 'वेबसाइट नीतियां', path: '/website-policy' },
  ];

  const dashboardLinks = [
    { nameEn: 'Dashboard Overview', nameHi: 'डैशबोर्ड अवलोकन', path: '/dashboard' },
    { nameEn: 'Live Tracking', nameHi: 'लाइव ट्रैकिंग', path: '/dashboard/tracking' },
    { nameEn: 'Vehicle History', nameHi: 'वाहन इतिहास', path: '/dashboard/history' },
    { nameEn: 'Route Replay', nameHi: 'रूट रिप्ले', path: '/dashboard/route-replay' },
    { nameEn: 'Public Grievances', nameHi: 'सार्वजनिक शिकायतें', path: '/dashboard/complaints' },
    { nameEn: 'Vehicles', nameHi: 'वाहन सूची', path: '/dashboard/vehicles' },
    { nameEn: 'Media & Daily Work', nameHi: 'मीडिया और दैनिक कार्य', path: '/dashboard/media' },
  ];

  const sectionLinks = [
    { nameEn: 'About Us Section', nameHi: 'हमारे बारे में (अनुभाग)', path: '/#about' },
    { nameEn: 'Notices Section', nameHi: 'सूचनाएं (अनुभाग)', path: '/#notices' },
    { nameEn: 'Documents Section', nameHi: 'दस्तावेज़ (अनुभाग)', path: '/#documents' },
    { nameEn: 'Daily Work / Blogs', nameHi: 'दैनिक कार्य / ब्लॉग', path: '/#blogs' },
    { nameEn: 'Complaint Form', nameHi: 'शिकायत फॉर्म', path: '/#complaint' },
    { nameEn: 'Contact Us', nameHi: 'संपर्क करें', path: '/#contact' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-2">
          {isHi ? 'साइट मैप' : 'Site Map'}
        </h1>
        <div className="h-1 w-20 bg-amber-500 rounded"></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 text-slate-700">
          
          {/* Public Pages */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy-800 mb-4 border-b border-slate-200 pb-2">
              {isHi ? 'सार्वजनिक पृष्ठ' : 'Public Pages'}
            </h2>
            <ul className="space-y-3">
              {publicLinks.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-navy-600 hover:text-amber-600 hover:underline transition-colors flex items-center gap-2"
                  >
                    <span className="text-slate-400 text-xs">▶</span>
                    {isHi ? link.nameHi : link.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Home Page Sections */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy-800 mb-4 border-b border-slate-200 pb-2">
              {isHi ? 'मुख्य पृष्ठ अनुभाग' : 'Home Page Sections'}
            </h2>
            <ul className="space-y-3">
              {sectionLinks.map((link, idx) => (
                <li key={idx}>
                  <a 
                    href={link.path} 
                    className="text-navy-600 hover:text-amber-600 hover:underline transition-colors flex items-center gap-2"
                  >
                    <span className="text-slate-400 text-xs">▶</span>
                    {isHi ? link.nameHi : link.nameEn}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Dashboard Pages */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 sm:p-8">
            <h2 className="text-xl font-bold text-navy-800 mb-4 border-b border-slate-200 pb-2">
              {isHi ? 'डैशबोर्ड (लॉगिन)' : 'Dashboard (Login)'}
            </h2>
            <ul className="space-y-3">
              {dashboardLinks.map((link, idx) => (
                <li key={idx}>
                  <Link 
                    to={link.path} 
                    className="text-navy-600 hover:text-amber-600 hover:underline transition-colors flex items-center gap-2"
                  >
                    <span className="text-slate-400 text-xs">▶</span>
                    {isHi ? link.nameHi : link.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
