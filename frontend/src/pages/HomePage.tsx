import React from 'react';
import { HeroSection } from '@/components/HeroSection';
import { AboutSection } from '@/components/AboutSection';
import { WasteSegregationSection } from '@/components/WasteSegregationSection';
import { SwachhataPledgeSection } from '@/components/SwachhataPledgeSection';
import { NoticesSection } from '@/components/NoticesSection';
import { DailyWorkSection } from '@/components/DailyWorkSection';

export const HomePage = React.memo(() => {
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
