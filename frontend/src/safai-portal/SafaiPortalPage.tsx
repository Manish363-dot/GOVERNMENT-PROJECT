import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { SafaiHeroBanner } from './SafaiHeroBanner';

// Lazy load Safai Sections directly from within safai-portal module
const AboutSection = lazy(() => import('./AboutSection').then(m => ({ default: m.AboutSection })));
const LiveQuotesSection = lazy(() => import('./LiveQuotesSection').then(m => ({ default: m.LiveQuotesSection })));
const WasteSegregationSection = lazy(() => import('./WasteSegregationSection').then(m => ({ default: m.WasteSegregationSection })));
const DailyWorkSection = lazy(() => import('./DailyWorkSection').then(m => ({ default: m.DailyWorkSection })));
const SwachhataPledgeSection = lazy(() => import('./SwachhataPledgeSection').then(m => ({ default: m.SwachhataPledgeSection })));

export const SafaiPortalPage = React.memo(() => {
  const location = useLocation();

  useEffect(() => {
    const h = location.hash.toLowerCase();
    let targetId: string | null = null;

    if (h === '#pledge') {
      targetId = 'pledge';
    } else if (h === '#daily-work' || h === '#dailywork' || h === '#blogs') {
      targetId = 'daily-work';
    } else if (h === '#waste-protocol' || h === '#waste-segregation') {
      targetId = 'waste-protocol';
    } else if (h === '#about-swm' || h === '#services') {
      targetId = 'about-swm';
    }

    if (targetId) {
      const el = document.getElementById(targetId) || document.getElementById(targetId.toLowerCase());
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 120);
      }
    }
  }, [location.hash]);

  return (
    <>
      <SafaiHeroBanner />
      <Suspense fallback={<div className="h-32 flex items-center justify-center text-slate-400">Loading Safai Portal...</div>}>
        <div id="about-swm">
          <AboutSection />
        </div>
        <LiveQuotesSection />
        <WasteSegregationSection />
        <DailyWorkSection />
        <SwachhataPledgeSection />
      </Suspense>
    </>
  );
});

SafaiPortalPage.displayName = 'SafaiPortalPage';
