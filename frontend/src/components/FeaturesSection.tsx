import { MapPin, Calendar, MessageSquareWarning } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: MapPin,
    title: 'Real-Time Tracking',
    description: 'Track garbage collection vehicles and monitor their current location on a live map.',
    color: 'bg-blue-50 text-primary',
    border: 'hover:border-primary/30',
  },
  {
    icon: Calendar,
    title: 'Daily History',
    description: 'View daily vehicle routes and location history to monitor collection coverage.',
    color: 'bg-green-50 text-success',
    border: 'hover:border-success/30',
  },
  {
    icon: MessageSquareWarning,
    title: 'Complaint Management',
    description: 'Citizens can register complaints and admins can track and resolve them efficiently.',
    color: 'bg-orange-50 text-accent',
    border: 'hover:border-accent/30',
  },
];

export function FeaturesSection() {
  return (
    <section id="tracking-info" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
            Key Features
          </h2>
          <p className="text-secondary-text max-w-2xl mx-auto">
            A simple yet powerful platform to manage waste collection operations efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className={`group cursor-default transition-all duration-300 hover:-translate-y-1 ${feature.border}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-8">
                <div className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-poppins text-xl font-semibold text-navy-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-secondary-text leading-relaxed">
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
