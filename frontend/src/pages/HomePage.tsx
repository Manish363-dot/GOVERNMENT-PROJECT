import { HeroSection } from '@/components/HeroSection';
import { ComplaintForm } from '@/components/ComplaintForm';
import { TollFreeSection } from '@/components/TollFreeSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ComplaintForm />
      <TollFreeSection />
      <ContactSection />
    </>
  );
}
