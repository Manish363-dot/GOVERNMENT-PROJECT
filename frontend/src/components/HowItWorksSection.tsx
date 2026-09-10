import { Satellite, Server, Database, Monitor, Radio } from 'lucide-react';

const steps = [
  { icon: Satellite, label: 'GPS Device', desc: 'On garbage vehicle', color: 'bg-blue-500' },
  { icon: Radio, label: 'GPS Sends Location', desc: 'Via SIM/Internet', color: 'bg-indigo-500' },
  { icon: Server, label: 'Backend Processes', desc: 'Validates & routes data', color: 'bg-violet-500' },
  { icon: Database, label: 'Supabase Stores', desc: 'Saves location data', color: 'bg-purple-500' },
  { icon: Monitor, label: 'Admin Tracks Live', desc: 'Real-time on map', color: 'bg-primary' },
];

export function HowItWorksSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            How It Works
          </h2>
          <p className="text-secondary-text max-w-2xl mx-auto">
            From GPS device to live tracking — a seamless data flow.
          </p>
        </div>

        {/* Desktop: Horizontal Flow */}
        <div className="hidden md:flex items-start justify-between relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-blue-200 via-violet-200 to-primary-200" />
          
          {steps.map((step, index) => (
            <div key={step.label} className="flex flex-col items-center text-center relative z-10 flex-1">
              <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center text-white shadow-lg mb-4 hover:scale-110 transition-transform duration-300`}>
                <step.icon className="w-7 h-7" />
              </div>
              <h4 className="font-poppins font-semibold text-sm text-navy-900 mb-1">{step.label}</h4>
              <p className="text-xs text-secondary-text max-w-[120px]">{step.desc}</p>
              
              {/* Arrow */}
              {index < steps.length - 1 && (
                <div className="absolute top-8 -right-3 text-navy-300 hidden lg:block">
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path d="M14 1L19 6L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile: Vertical Flow */}
        <div className="md:hidden space-y-0">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                  <step.icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className="w-0.5 h-8 bg-gradient-to-b from-navy-200 to-transparent mt-1" />
                )}
              </div>
              <div className="pt-2 pb-6">
                <h4 className="font-poppins font-semibold text-sm text-navy-900">{step.label}</h4>
                <p className="text-xs text-secondary-text">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
