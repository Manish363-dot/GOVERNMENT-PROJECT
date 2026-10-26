import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { RentalNavbar } from './components/RentalNavbar';
import { HeroSimple } from './components/HeroSection';
import { AnnouncementTicker } from './components/AnnouncementTicker';
import { CitizenServicesHub } from './components/CitizenServicesHub';
import { QuickPaySection } from './components/QuickPaySection';
import { AboutSection } from './components/AboutSection';
import { PropertiesSection } from './components/PropertiesSection';
import { NoticesSection } from './components/NoticesSection';
import { DocumentsSection } from './components/DocumentsSection';
import { AdminSignInPage } from './pages/AdminSignInPage';
import { useLanguage } from './context/LanguageContext';
import { Phone, Mail, MapPin, Clock, ExternalLink, ShieldCheck } from 'lucide-react';

/* Landing Page component — all sections */
const LandingPage: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] w-full overflow-x-hidden font-sans">
      {/* 🏛️ Official 3-Tier Government Navbar */}
      <RentalNavbar />

      {/* 🚀 Main Page Content */}
      <main className="flex-1 w-full">
        {/* 1. Official Government Hero Section (Clean HeroSimple) */}
        <div id="home">
          <HeroSimple />
        </div>

        {/* 📢 Official Government News Ticker */}
        <AnnouncementTicker />

        {/* 2. Official Citizen Services Hub */}
        <CitizenServicesHub />

        {/* 3. Citizen Quick Pay & Dues Search (PRD Section 5 & 12) */}
        <QuickPaySection />

        {/* 4. About Zila Panchayat Almora (PRD Section 5 - About Us) */}
        <AboutSection />

        {/* 5. Public Properties & E-Auction Register (PRD Section 5 & 8) */}
        <PropertiesSection />

        {/* 6. Public Notices & Orders (PRD Section 5 & 16) */}
        <NoticesSection />

        {/* 7. Bylaws, Rules & Documents (PRD Section 5 - Documents) */}
        <DocumentsSection />
      </main>

      {/* 🏛️ Official Government Footer (PRD Section 5 - Contact Us) */}
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

            {/* Col 2: Official Quick Links (PRD Section 5) */}
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
                    {isHi ? 'शासकीय नागरिक सेवाएं' : 'Citizen Services Hub'}
                  </a>
                </li>
                <li>
                  <a href="#quick-pay" className="hover:text-amber-400 transition-colors">
                    {t.nav.payRent}
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-amber-400 transition-colors">
                    {t.footer.linkAbout}
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
                <li>
                  <a href="#feedback" className="hover:text-amber-400 transition-colors">
                    {t.footer.linkFeedback}
                  </a>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Working Hours */}
            <div>
              <h5 className="text-white font-bold text-sm mb-3 border-b border-slate-700 pb-1 inline-block">
                {t.footer.contactTitle}
              </h5>
              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{t.footer.contactAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.common.helpline}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{t.common.email}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-400 pt-1">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{t.footer.officeHours}</span>
                </div>
              </div>
            </div>
          </div>

          {/* National & State Government Links Strip */}
          <div className="py-4 border-b border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-3">
            <span className="font-semibold text-slate-300">
              {isHi ? 'महत्वपूर्ण शासकीय लिंक:' : 'Important Govt Portals:'}
            </span>
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="https://uk.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>उत्तराखंड शासन (uk.gov.in)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://panchayat.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>पंचायती राज मंत्रालय (panchayat.gov.in)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://swachhbharatmission.ddws.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>स्वच्छ भारत मिशन</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="https://india.gov.in"
                target="_blank"
                rel="noreferrer"
                className="hover:text-amber-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>राष्ट्रीय पोर्टल (india.gov.in)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
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

import { RegisterTenantPage } from './admin/RegisterTenantPage';
import { TenantListPage } from './admin/TenantListPage';
import { PropertyManagementPage } from './admin/PropertyManagementPage';
import { BillingManagementPage } from './admin/BillingManagementPage';

// Admin Pages
import { AdminDashboardPage } from './admin/AdminDashboardPage';
import { SubAdminManagementPage } from './admin/SubAdminManagementPage';
import { RegisterSubAdminPage } from './admin/RegisterSubAdminPage';
import { RecordsAuditPage } from './admin/RecordsAuditPage';
import { AdminNoticesPage } from './admin/AdminNoticesPage';

// User / Tenant Pages
import { UserDashboardPage } from './user/UserDashboardPage';
import { UserBillsPage } from './user/UserBillsPage';
import { UserReceiptsPage } from './user/UserReceiptsPage';
import { UserNoticesPage } from './user/UserNoticesPage';
import { UserProfilePage } from './user/UserProfilePage';

import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';

/* Root App with routing */
export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminSignInPage initialRole="admin" />} />
          <Route path="/signin" element={<AdminSignInPage initialRole="user" />} />
          <Route path="/login" element={<AdminSignInPage initialRole="user" />} />
          <Route path="/admin/signup" element={<AdminSignInPage initialRole="admin" />} />
          <Route path="/signup" element={<AdminSignInPage initialRole="user" />} />
          
          {/* ── ADMIN PANEL ROUTES ─────────────────────────────────────────── */}
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/subadmins" element={<SubAdminManagementPage />} />
          <Route path="/admin/register-subadmin" element={<RegisterSubAdminPage />} />
          <Route path="/admin/records" element={<RecordsAuditPage />} />
          <Route path="/admin/audit" element={<RecordsAuditPage />} />
          <Route path="/admin/properties" element={<PropertyManagementPage />} />
          <Route path="/admin/tenants" element={<TenantListPage />} />
          <Route path="/admin/register-tenant" element={<RegisterTenantPage />} />
          <Route path="/admin/billing" element={<BillingManagementPage />} />
          <Route path="/admin/notices" element={<AdminNoticesPage />} />

          {/* ── USER / TENANT PANEL ROUTES ─────────────────────────────────── */}
          <Route path="/user/dashboard" element={<UserDashboardPage />} />
          <Route path="/user" element={<UserDashboardPage />} />
          <Route path="/user/bills" element={<UserBillsPage />} />
          <Route path="/user/receipts" element={<UserReceiptsPage />} />
          <Route path="/user/notices" element={<UserNoticesPage />} />
          <Route path="/user/profile" element={<UserProfilePage />} />
          <Route path="/profile" element={<UserProfilePage />} />

          {/* Catch-all → redirect home */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </AuthProvider>
    </LanguageProvider>
  );
};
