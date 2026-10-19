import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { WasteSegregationSection } from '@/components/WasteSegregationSection';
import { SwachhataPledgeSection } from '@/components/SwachhataPledgeSection';
import { NoticesSection } from '@/components/NoticesSection';
import { DailyWorkSection } from '@/components/DailyWorkSection';

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
      <AboutSection />
      <WasteSegregationSection />
      <NoticesSection />
      <DailyWorkSection />
      <SwachhataPledgeSection />
    </>
  );
});
