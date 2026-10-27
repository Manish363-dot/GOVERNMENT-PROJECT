import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mail, ArrowLeft } from 'lucide-react';

export function RentalUnderDevelopmentPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi' || Boolean(i18n.language?.startsWith('hi'));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-slate-50">
      <div className="max-w-xl w-full text-center">
        
        {/* Simple Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 font-poppins mb-4">
          {isHi
            ? 'दुकान एवं संपत्ति किराया प्रबंधन पोर्टल'
            : 'Commercial Asset & Rental Portal'}
        </h1>

        {/* Simple Description */}
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
          {isHi
            ? 'यह पोर्टल वर्तमान में विकास के चरण में है और शीघ्र ही आपके बीच उपलब्ध होगा। किराया व संपत्ति संबंधी किसी भी अन्य जानकारी के लिए कृपया जिला पंचायत कार्यालय से संपर्क करें।'
            : 'This portal is currently under development and will be available soon. For further information regarding commercial rental and properties, please contact Zila Panchayat officials.'}
        </p>

        {/* 2 Buttons Only */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/contact"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-sm shadow-md transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span>{isHi ? 'संपर्क करें (Contact Us)' : 'Contact Us'}</span>
          </Link>

          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{isHi ? 'मुख्य पृष्ठ (Back Home)' : 'Back to Home'}</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default RentalUnderDevelopmentPage;
