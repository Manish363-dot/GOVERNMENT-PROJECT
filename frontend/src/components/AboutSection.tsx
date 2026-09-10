import { Truck, MapPin, History, Shield } from 'lucide-react';

const capabilities = [
  { icon: Truck, text: 'Track garbage vehicles in real time' },
  { icon: MapPin, text: 'Monitor collection operations across the district' },
  { icon: History, text: 'Store and view daily vehicle route history' },
  { icon: Shield, text: 'Receive and manage citizen complaints' },
];

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-navy-900 mb-6">
              About Zila Panchayat Safai
            </h2>
            <p className="text-secondary-text leading-relaxed mb-6">
              Zila Panchayat Safai is a modern smart platform designed to help Zila Panchayat efficiently manage waste collection operations. By leveraging real-time GPS tracking technology, our system provides complete transparency and accountability in garbage collection services.
            </p>
            <p className="text-secondary-text leading-relaxed mb-8">
              The platform empowers administrators with live vehicle tracking, historical route data, and a streamlined complaint management system to ensure clean and healthy communities.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {capabilities.map((cap) => (
                <div key={cap.text} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-border hover:border-primary/20 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <cap.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm text-navy-700 pt-1.5">{cap.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary-50 to-blue-100 rounded-2xl p-10 border border-primary-100">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-border text-center">
                    <Truck className="w-8 h-8 text-primary mx-auto mb-2" />
                    <p className="font-poppins font-bold text-2xl text-navy-900">GPS</p>
                    <p className="text-xs text-secondary-text">Real-Time Tracking</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-border text-center">
                    <MapPin className="w-8 h-8 text-success mx-auto mb-2" />
                    <p className="font-poppins font-bold text-2xl text-navy-900">Live</p>
                    <p className="text-xs text-secondary-text">Vehicle Monitoring</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-border text-center">
                    <History className="w-8 h-8 text-accent mx-auto mb-2" />
                    <p className="font-poppins font-bold text-2xl text-navy-900">Daily</p>
                    <p className="text-xs text-secondary-text">Route History</p>
                  </div>
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-border text-center">
                    <Shield className="w-8 h-8 text-danger mx-auto mb-2" />
                    <p className="font-poppins font-bold text-2xl text-navy-900">Secure</p>
                    <p className="text-xs text-secondary-text">Data Protection</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
