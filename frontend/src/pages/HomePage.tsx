import { HeroSection } from '@/components/HeroSection';
import { ComplaintForm } from '@/components/ComplaintForm';
import { AboutSection } from '@/components/AboutSection';
import { NoticesSection } from '@/components/NoticesSection';
import { DocumentsSection } from '@/components/DocumentsSection';
import { ContactSection } from '@/components/ContactSection';

import { DailyWorkSection } from '@/components/DailyWorkSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <NoticesSection />
      <DocumentsSection />
      <DailyWorkSection />
      <ComplaintForm />
      <ContactSection />
    </>
  );
}
