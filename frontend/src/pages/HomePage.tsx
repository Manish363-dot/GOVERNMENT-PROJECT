import { HeroSection } from '@/components/HeroSection';
import { ComplaintForm } from '@/components/ComplaintForm';
import { TollFreeSection } from '@/components/TollFreeSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';

import { DailyWorkSection } from '@/components/DailyWorkSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <DailyWorkSection />
      <ComplaintForm />
      <TollFreeSection />
      <ContactSection />
    </>
  );
}
