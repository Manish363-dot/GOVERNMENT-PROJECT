import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from './HeroSection';

// Lazy load official landing-page below-fold sections
const ZilaPanchayatAboutSection = lazy(() => import('./ZilaPanchayatAboutSection').then(m => ({ default: m.ZilaPanchayatAboutSection })));
const AlmoraBlocksSection = lazy(() => import('./AlmoraBlocksSection').then(m => ({ default: m.AlmoraBlocksSection })));
const ZilaServicesHubSection = lazy(() => import('./ZilaServicesHubSection').then(m => ({ default: m.ZilaServicesHubSection })));
const NoticesSection = lazy(() => import('./NoticesSection').then(m => ({ default: m.NoticesSection })));

export const MainLandingPage = React.memo(() => {
  const location = useLocation();

  useEffect(() => {
    const p = location.pathname;
    const h = location.hash.toLowerCase();
    let targetId: string | null = null;

    if (p === '/notices' || p === '/notices-and-updates' || h === '#notices') {
      targetId = 'Notices';
    } else if (h === '#about-zp' || h === '#about') {
      targetId = 'about-zp';
    } else if (h === '#blocks') {
      targetId = 'blocks';
    } else if (h === '#services-hub' || h === '#services') {
      targetId = 'services-hub';
    }

    if (targetId) {
      const el = document.getElementById(targetId) || document.getElementById(targetId.toLowerCase());
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, [location.pathname, location.hash]);

  return (
    <>
      <HeroSection />
      <Suspense fallback={<div className="h-32 flex items-center justify-center text-slate-400">Loading Zila Panchayat Portal...</div>}>
        <ZilaPanchayatAboutSection />
        <AlmoraBlocksSection />
        <ZilaServicesHubSection />
        <NoticesSection />
      </Suspense>
    </>
  );
});

MainLandingPage.displayName = 'MainLandingPage';
