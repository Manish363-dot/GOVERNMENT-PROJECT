import { Button } from '@/components/ui/button';
import { MapPin, Truck, Radio, Navigation } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function HeroSection() {
  const { t } = useTranslation();
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-900 via-navy-800 to-primary-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 border border-white/10">
              <Radio className="w-3.5 h-3.5 text-success animate-pulse" />
              <span className="text-xs font-medium text-primary-200">{t('hero.badge')}</span>
            </div>

            <h1 className="font-poppins text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              {t('hero.title').split(' ').map((word, i, arr) => 
                i === arr.length - 1 ? <span key={i} className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-500 block mt-2">{word}</span> : word + ' '
              )}
            </h1>

            <p className="text-lg text-navy-200 mb-8 max-w-lg leading-relaxed">
              {t('hero.subtitle')}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-700 text-white shadow-lg shadow-primary/25" asChild>
                <a href="#tracking-info">
                  <MapPin className="w-4 h-4" />
                  {t('hero.liveTracking')}
                </a>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:text-white" asChild>
                <a href="#complaint">
                  {t('hero.registerComplaint')}
                </a>
              </Button>
            </div>
          </div>

          {/* Hero Illustration (CSS/SVG) */}
          <div className="hidden lg:flex items-center justify-center animate-slide-up">
            <div className="relative w-full max-w-md">
              {/* Map card */}
              <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-2xl">
                {/* Map header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                    <span className="text-sm font-medium text-white/80">Live Tracking</span>
                  </div>
                  <span className="text-xs text-white/50">3 vehicles online</span>
                </div>

                {/* Simulated map */}
                <div className="relative bg-navy-800/50 rounded-xl h-48 overflow-hidden border border-white/5">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                  }} />
                  
                  {/* Road lines */}
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/10" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-[2px] bg-white/10" />

                  {/* Vehicle markers */}
                  <div className="absolute top-[30%] left-[25%] animate-float" style={{ animationDelay: '0s' }}>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-success" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-navy-800" />
                    </div>
                  </div>

                  <div className="absolute top-[60%] left-[55%] animate-float" style={{ animationDelay: '1s' }}>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-accent" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-navy-800" />
                    </div>
                  </div>

                  <div className="absolute top-[40%] left-[75%] animate-float" style={{ animationDelay: '2s' }}>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
                        <Truck className="w-4 h-4 text-success" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-navy-800" />
                    </div>
                  </div>

                  {/* Route line */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200">
                    <path
                      d="M 100,60 C 150,80 180,120 220,120 S 280,90 300,80"
                      stroke="rgba(34,197,94,0.3)"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray="5,5"
                    />
                  </svg>
                </div>

                {/* Bottom info cards */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
                    <p className="text-xs text-white/50">Moving</p>
                    <p className="font-poppins font-bold text-success">2</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
                    <p className="text-xs text-white/50">Idle</p>
                    <p className="font-poppins font-bold text-accent">1</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 text-center border border-white/5">
                    <p className="text-xs text-white/50">Routes</p>
                    <p className="font-poppins font-bold text-primary-300">5</p>
                  </div>
                </div>
              </div>

              {/* Floating notification */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-xl p-3 animate-float border border-border" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
                    <Navigation className="w-4 h-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-navy-900">MP-09-XX-1234</p>
                    <p className="text-[10px] text-secondary-text">Route completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 56" fill="none" className="w-full h-14">
          <path d="M0 56V20C360 -4 720 44 1080 20C1260 8 1380 12 1440 20V56H0Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
