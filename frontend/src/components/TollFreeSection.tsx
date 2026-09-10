import { Phone } from 'lucide-react';

export function TollFreeSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary to-primary-700 rounded-2xl p-8 sm:p-12 text-center text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-white/5" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/5" />
          </div>

          <div className="relative">
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold mb-4">
              Need Help?
            </h2>
            <p className="text-primary-100 mb-8 max-w-md mx-auto">
              Call our toll-free number to register your complaint or get assistance.
            </p>

            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-5 border border-white/20">
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs text-primary-200 font-medium uppercase tracking-wider">Toll-Free Number</p>
                <p className="font-poppins text-2xl sm:text-3xl font-bold tracking-wide">1800-XXX-XXXX</p>
              </div>
            </div>

            <p className="mt-6 text-sm text-primary-200">
              Available 24/7 • Free from all networks
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
