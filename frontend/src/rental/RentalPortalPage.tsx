import React, { useEffect } from 'react';
import { RentalNavbar } from './components/RentalNavbar';
import { HeroSimple } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { NoticesSection } from './components/NoticesSection';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { Footer } from '@/components/Footer';

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
      <RentalNavbar />
      {/* 🚀 Main Page Content */}
      <main className="flex-1 w-full">
        {/* 1. Official Government Hero Section */}
        <div id="home">
          <HeroSimple />
        </div>

        {/* 2. About Zila Panchayat Almora Commercial Assets */}
        <AboutSection />

        {/* 3. Public Notices & Orders */}
        <NoticesSection />
      </main>

      {/* 🏛️ Official Website Footer */}
      <Footer />
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
