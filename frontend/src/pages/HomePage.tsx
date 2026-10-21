import React, { useEffect, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';

// Lazy load all below-fold sections — reduces initial bundle size
const LiveQuotesSection = lazy(() => import('@/components/LiveQuotesSection').then(m => ({ default: m.LiveQuotesSection })));
const AboutSection = lazy(() => import('@/components/AboutSection').then(m => ({ default: m.AboutSection })));
const WasteSegregationSection = lazy(() => import('@/components/WasteSegregationSection').then(m => ({ default: m.WasteSegregationSection })));
const NoticesSection = lazy(() => import('@/components/NoticesSection').then(m => ({ default: m.NoticesSection })));
const DailyWorkSection = lazy(() => import('@/components/DailyWorkSection').then(m => ({ default: m.DailyWorkSection })));
const SwachhataPledgeSection = lazy(() => import('@/components/SwachhataPledgeSection').then(m => ({ default: m.SwachhataPledgeSection })));

export const HomePage = React.memo(() => {
  const location = useLocation();

  useEffect(() => {
    const p = location.pathname;
    const h = location.hash.toLowerCase();

    let targetId: string | null = null;

    if (p === '/notices' || p === '/notices-and-updates' || h === '#notices') {
      targetId = 'Notices';
    } else if (p === '/pledge' || p === '/swachhata-pledge' || h === '#pledge') {
      targetId = 'pledge';
    } else if (p === '/daily-work' || p === '/dailywork' || p === '/blogs' || h === '#blogs' || h === '#daily-work') {
      targetId = 'daily-work';
    } else if (p === '/waste-protocol' || p === '/waste-segregation' || h === '#waste-protocol' || h === '#waste-segregation') {
      targetId = 'waste-protocol';
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
      <Suspense fallback={<div className="h-32" />}>
        <AboutSection />
        <LiveQuotesSection />
        <WasteSegregationSection />
        <NoticesSection />
        <DailyWorkSection />
        <SwachhataPledgeSection />
      </Suspense>
    </>
  );
});

