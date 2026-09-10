import { HeroSection } from '@/components/HeroSection';
import { FeaturesSection } from '@/components/FeaturesSection';
import { HowItWorksSection } from '@/components/HowItWorksSection';
import { ComplaintForm } from '@/components/ComplaintForm';
import { TollFreeSection } from '@/components/TollFreeSection';
import { AboutSection } from '@/components/AboutSection';
import { ContactSection } from '@/components/ContactSection';

export function HomePage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <ComplaintForm />
      <TollFreeSection />
      <AboutSection />
      <ContactSection />
    </>
  );
}
