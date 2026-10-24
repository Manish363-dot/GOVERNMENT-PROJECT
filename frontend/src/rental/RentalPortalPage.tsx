import React, { useEffect } from 'react';
import { RentalNavbar } from './components/RentalNavbar';
import { HeroSimple } from './components/HeroSection';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { CitizenServicesHub } from './components/CitizenServicesHub';
import { QuickPaySection } from './components/QuickPaySection';
import { AboutSection } from './components/AboutSection';
import { PropertiesSection } from './components/PropertiesSection';
import { NoticesSection } from './components/NoticesSection';
import { DocumentsSection } from './components/DocumentsSection';
import { FeedbackSection } from './components/FeedbackSection';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ShieldCheck, ExternalLink } from 'lucide-react';

const RentalLandingContent: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  useEffect(() => {
    // Check hash for smooth scrolling on initial load
    if (window.location.hash) {
      const id = window.location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 150);
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] w-full overflow-x-hidden font-sans">
      {/* 🏛️ Official 3-Tier Government Rental Navbar */}
      <RentalNavbar />

      {/* 🚀 Main Page Content */}
      <main className="flex-1 w-full">
        {/* 1. Official Government Hero Section */}
        <div id="home">
          <HeroSimple />
        </div>

        {/* 📢 Official Government News Ticker */}
        <AnnouncementTicker />

        {/* 2. Official Citizen Services Hub */}
        <CitizenServicesHub />

        {/* 3. Citizen Quick Pay & Dues Search */}
        <QuickPaySection />

        {/* 4. About Zila Panchayat Almora Commercial Assets */}
        <AboutSection />

        {/* 5. Public Properties & E-Auction Register */}
        <PropertiesSection />

        {/* 6. Public Notices & Orders */}
        <NoticesSection />

        {/* 7. Bylaws, Rules & Documents */}
        <DocumentsSection />

        {/* 8. Citizen Grievance & Feedback Form */}
        <FeedbackSection />
      </main>

      {/* 🏛️ Official Government Footer */}
      <footer id="contact" className="bg-[#0b1b36] text-slate-300 text-xs border-t-2 border-amber-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
            {/* Col 1: Government Authority */}
            <div className="space-y-3 md:col-span-1 lg:col-span-2">
              <div className="flex items-center space-x-3 text-white font-bold text-sm">
                <img
                  src="/assets/logos/logo1.png"
                  alt="उत्तराखंड शासन"
                  className="h-9 w-auto"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div>
                  <div className="text-white font-bold text-sm sm:text-base leading-tight">
                    {t.footer.officeTitle}
                  </div>
                  <div className="text-amber-400 text-xs font-semibold">
                    {isHi ? 'पंचायती राज विभाग, उत्तराखंड शासन' : 'Department of Panchayati Raj, Govt. of Uttarakhand'}
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-lg">
                {t.footer.officeDesc}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isHi ? 'अधिकृत शासकीय वेब पोर्टल (Government of Uttarakhand)' : 'Official Government Portal (Uttarakhand)'}</span>
              </div>
            </div>

            {/* Col 2: Official Quick Links */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1 inline-block">
                {t.footer.quickLinks}
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="#home" className="hover:text-amber-400 transition-colors">
                    {t.footer.linkHome}
                  </a>
                </li>
                <li>
                  <a href="#services-hub" className="hover:text-amber-400 transition-colors">
                    {isHi ? 'नागरिक सेवाएं' : 'Services'}
                  </a>
                </li>
                <li>
                  <a href="#properties" className="hover:text-amber-400 transition-colors">
                    {t.footer.linkProperties}
                  </a>
                </li>
                <li>
                  <a href="#notices" className="hover:text-amber-400 transition-colors">
                    {t.footer.linkNotices}
                  </a>
                </li>
                <li>
                  <a href="#documents" className="hover:text-amber-400 transition-colors">
                    {t.footer.linkDocuments}
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Important Official Links */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1 inline-block">
                {t.footer.importantLinks}
              </h5>
              <ul className="space-y-2 text-xs">
                <li>
                  <a
                    href="https://panchayat.uk.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{t.footer.linkPanchayatiRaj}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://uk.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{t.footer.linkUkGov}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://almora.nic.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{t.footer.linkDistrictAlmora}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
                <li>
                  <a
                    href="https://eauction.gov.in"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 transition-colors inline-flex items-center gap-1"
                  >
                    <span>{t.footer.linkEAuction}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>{t.footer.copyright}</div>
            <div className="text-slate-400 font-medium">{t.footer.credits}</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const RentalPortalPage: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <RentalLandingContent />
      </AuthProvider>
    </LanguageProvider>
  );
};

export default RentalPortalPage;
