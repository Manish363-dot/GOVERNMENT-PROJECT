import { MapPin, Calendar, MessageSquareWarning, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Fleet Tracking',
    description: 'Track garbage collection vehicles live on an interactive map across district Panchayats.',
    badge: 'Live Operations',
    iconBg: 'bg-navy-900 text-amber-400',
  },
  {
    icon: Calendar,
    title: 'Daily Route History',
    description: 'Access complete historical route logs and coverage data for audit and performance analysis.',
    badge: 'Audit & Records',
    iconBg: 'bg-emerald-900 text-emerald-300',
  },
  {
    icon: MessageSquareWarning,
    title: 'Grievance Management',
    description: 'Citizens can easily submit complaints regarding missed waste collections and track resolution.',
    badge: 'Citizen Services',
    iconBg: 'bg-amber-900 text-amber-300',
  },
];

export function FeaturesSection() {
  return (
    <section id="tracking-info" className="pt-20 sm:pt-28 pb-16 sm:pb-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 text-navy-900 text-xs font-semibold uppercase tracking-wider mb-3 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Key Portal Services
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
            Core System Capabilities
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            Essential digital features for district waste management oversight and citizen grievance redressal.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border border-slate-200 shadow-xs hover:border-slate-300 transition-all rounded-lg bg-slate-50/50"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-md ${feature.iconBg} flex items-center justify-center shadow-xs`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-slate-200">
                    {feature.badge}
                  </span>
                </div>
                <h3 className="font-poppins text-lg font-bold text-navy-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
