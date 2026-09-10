import { Link } from 'react-router-dom';
import { Truck, Phone, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-poppins font-bold text-white text-lg block leading-tight">
                  Zila Panchayat
                </span>
                <span className="text-[10px] font-medium text-primary-300 tracking-wider uppercase">
                  Safai
                </span>
              </div>
            </div>
            <p className="text-sm text-navy-300 leading-relaxed">
              Smart Waste Collection Tracking & Complaint Management System
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-sm mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Complaint', 'Contact'].map((item) => (
                <li key={item}>
                  <a
                    href={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                    className="text-sm text-navy-300 hover:text-white transition-colors duration-200"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-poppins font-semibold text-sm mb-4 text-white">Services</h4>
            <ul className="space-y-2">
              {['Real-Time Tracking', 'Daily History', 'Complaint Registration', 'Vehicle Management'].map((item) => (
                <li key={item}>
                  <span className="text-sm text-navy-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-sm mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-navy-300">1800-XXX-XXXX</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary-400" />
                <span className="text-sm text-navy-300">safai@zilapanchayat.gov.in</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary-400 mt-0.5" />
                <span className="text-sm text-navy-300">Zila Panchayat Office, District HQ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-8 pt-8 text-center">
          <p className="text-sm text-navy-400">
            © {new Date().getFullYear()} Zila Panchayat Safai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
