import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ExternalLink,
  Building2,
  Send,
  CheckCircle2,
  User,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  ShieldCheck,
  FileCheck2,
  Headphones,
  Truck,
  MessageSquareWarning,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { contactService, ContactFormData } from '@/services/contact.service';

export function ContactPage() {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Form State
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ referenceId: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Validate single field or all fields
  const validateField = (field: keyof ContactFormData, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) {
          return isHi ? 'कृपया अपना नाम दर्ज करें' : 'Full name is required';
        }
        if (value.trim().length < 2) {
          return isHi ? 'नाम कम से कम 2 अक्षरों का होना चाहिए' : 'Name must be at least 2 characters';
        }
        if (value.trim().length > 100) {
          return isHi ? 'नाम 100 अक्षरों से अधिक नहीं होना चाहिए' : 'Name cannot exceed 100 characters';
        }
        return '';

      case 'email':
        if (!value.trim()) {
          return isHi ? 'कृपया ईमेल पता दर्ज करें' : 'Email address is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          return isHi ? 'कृपया एक वैध ईमेल पता दर्ज करें (उदा. user@example.com)' : 'Please enter a valid email address';
        }
        return '';

      case 'phone':
        if (value.trim() && !/^[6-9]\d{9}$/.test(value.trim())) {
          return isHi ? 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें' : 'Please enter a valid 10-digit mobile number';
        }
        return '';

      case 'subject':
        if (!value.trim()) {
          return isHi ? 'कृपया संदेश का विषय या श्रेणी चुनें' : 'Subject is required';
        }
        if (value.trim().length < 3) {
          return isHi ? 'विषय कम से कम 3 अक्षरों का होना चाहिए' : 'Subject must be at least 3 characters';
        }
        return '';

      case 'message':
        if (!value.trim()) {
          return isHi ? 'कृपया अपना संदेश या पूछताछ दर्ज करें' : 'Message is required';
        }
        if (value.trim().length < 10) {
          return isHi ? 'संदेश कम से कम 10 अक्षरों का होना चाहिए' : 'Message must be at least 10 characters';
        }
        if (value.trim().length > 2000) {
          return isHi ? 'संदेश 2000 अक्षरों से अधिक नहीं हो सकता' : 'Message cannot exceed 2000 characters';
        }
        return '';

      default:
        return '';
    }
  };

  const handleBlur = (field: keyof ContactFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field] || '');
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const quickSubjects = [
    isHi ? 'कचरा गाड़ी नहीं पहुँची' : 'Waste Vehicle Not Arrived',
    isHi ? 'सफाई एवं कूड़ा निस्तारण समस्या' : 'Garbage Collection Issue',
    isHi ? 'वाहन जीपीएस ट्रैकिंग पूछताछ' : 'GPS Tracking & Route Query',
    isHi ? 'सामान्य पूछताछ एवं सुझाव' : 'General Inquiry & Feedback',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: Record<string, string> = {
      name: validateField('name', formData.name),
      email: validateField('email', formData.email),
      phone: validateField('phone', formData.phone || ''),
      subject: validateField('subject', formData.subject),
      message: validateField('message', formData.message),
    };

    setTouched({
      name: true,
      email: true,
      phone: true,
      subject: true,
      message: true,
    });

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((err) => !!err);
    if (hasErrors) {
      toast.error(isHi ? 'कृपया प्रपत्र में आवश्यक त्रुटियों को सुधारें।' : 'Please fix the errors in the form before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await contactService.submitInquiry(formData);
      if (res.success) {
        setSubmitSuccess({ referenceId: res.referenceId || `INQ-${Date.now().toString().slice(-6)}` });
        toast.success(isHi ? 'आपका संदेश सफलतापूर्वक भेज दिया गया है!' : 'Your message has been sent successfully!');
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setTouched({});
        setErrors({});
      } else {
        throw new Error(res.message || 'Failed to send message');
      }
    } catch (err: any) {
      const errorMsg = err.message || (isHi ? 'संदेश भेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।' : 'Failed to send inquiry. Please try again.');
      setSubmitError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-[#0c2a52] text-white py-12 sm:py-16 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-poppins text-white tracking-tight mb-3">
            {isHi ? 'संपर्क करें' : 'Contact Administration'}
          </h1>
          <p className="text-slate-300 max-w-2xl text-sm sm:text-base leading-relaxed">
            {isHi 
              ? 'जिला पंचायत अल्मोड़ा — ठोस अपशिष्ट प्रबंधन, वाहन ट्रैकिंग एवं नागरिक शिकायत निवारण से संबंधित किसी भी जानकारी अथवा सहायता हेतु संपर्क करें।'
              : 'District Panchayat Almora — Reach out for inquiries, waste collection support, live vehicle tracking assistance, or grievance redressal.'}
          </p>
          <div className="h-1 w-24 bg-amber-400 rounded-full mt-6"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Main 3 Quick Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
          {/* Toll Free Card */}
          <Card className="bg-white border-slate-200/90 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center mb-4 shadow-sm">
                <Phone className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                {isHi ? 'टोल-फ्री नागरिक हेल्पलाइन' : 'Toll-Free Citizen Helpline'}
              </p>
              <a 
                href="tel:18001851850" 
                className="text-xl sm:text-2xl font-extrabold text-navy-900 hover:text-blue-700 transition-colors block mb-2 font-mono"
              >
                1800-185-1850
              </a>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isHi ? 'निःशुल्क हेल्पलाइन — समस्त कार्य दिवसों में सक्रिय' : 'Toll-free service available during all office hours'}
              </p>
            </CardContent>
          </Card>

          {/* Email Card */}
          <Card className="bg-white border-slate-200/90 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-800 text-emerald-100 flex items-center justify-center mb-4 shadow-sm">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                {isHi ? 'आधिकारिक ईमेल' : 'Official Email Address'}
              </p>
              <a 
                href="mailto:amazpalmora@gmail.com" 
                className="text-lg sm:text-xl font-bold text-navy-900 hover:text-emerald-700 transition-colors block mb-2 break-all"
              >
                amazpalmora@gmail.com
              </a>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isHi ? 'विभागीय पत्राचार एवं औपचारिक सुझाव हेतु' : 'For official correspondence and feedback'}
              </p>
            </CardContent>
          </Card>

          {/* Office Address Card */}
          <Card className="bg-white border-slate-200/90 shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-xl bg-amber-600 text-white flex items-center justify-center mb-4 shadow-sm">
                <MapPin className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
                {isHi ? 'मुख्यालय पता' : 'Head Office Address'}
              </p>
              <p className="font-bold text-navy-900 text-sm sm:text-base leading-snug mb-2">
                {isHi 
                  ? 'जिला पंचायत कार्यालय, धारानौला, अल्मोड़ा, उत्तराखंड — 263601'
                  : 'Zila Panchayat Office, Dharanaula, Almora, Uttarakhand — 263601'}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {isHi ? 'अपर मुख्य अधिकारी (AMA) कक्ष' : 'Office of Additional Chief Officer (AMA)'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Main Section: Form + Left Info & Right Info + Map ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
          
          {/* Left Column (7 cols): Email Sending Form */}
          <div className="lg:col-span-7 flex flex-col">
            
            {/* 1. Email Sending Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 flex-1 flex flex-col">
              
              {/* Form Title & Description */}
              <div className="border-b border-slate-100 pb-5 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold font-poppins text-navy-900">
                  {isHi ? 'प्रशासन को संदेश भेजें' : 'Send an Email Inquiry'}
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1 leading-relaxed">
                  {isHi 
                    ? 'कृपया नीचे दिए गए प्रपत्र को भरें। आपका संदेश जिला पंचायत अल्मोड़ा प्रशासन को सीधे प्रेषित कर दिया जाएगा।'
                    : 'Fill out the form below to email the District Panchayat Almora administration directly. An acknowledgment will be sent to your email.'}
                </p>
              </div>

              {/* Success Message Banner */}
              {submitSuccess && (
                <div className="mb-6 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-bold text-base text-emerald-900">
                        {isHi ? 'संदेश सफलतापूर्वक प्रेषित!' : 'Inquiry Submitted Successfully!'}
                      </h3>
                      <p className="text-xs sm:text-sm text-emerald-800 mt-1 leading-relaxed">
                        {isHi 
                          ? 'आपका संदेश संबंधित अधिकारियों को भेज दिया गया है। संदर्भ संख्या सुरक्षित रखें:'
                          : 'Your message has been emailed to the administration. Please keep your reference number for future tracking:'}
                      </p>
                      <div className="mt-3 inline-block px-3.5 py-1.5 rounded-lg bg-emerald-100/90 border border-emerald-300 font-mono font-extrabold text-sm text-emerald-900 tracking-wider">
                        {submitSuccess.referenceId}
                      </div>
                      <p className="text-[11px] text-emerald-700 mt-2">
                        {isHi 
                          ? 'एक पुष्टिकरण ईमेल आपके दिए गए पते पर भेज दिया गया है।'
                          : 'A confirmation receipt has also been dispatched to your email address.'}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSubmitSuccess(null)}
                        className="mt-4 text-xs bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-100"
                      >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        {isHi ? 'अन्य संदेश भेजें' : 'Send Another Inquiry'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Error Banner */}
              {submitError && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <p>{submitError}</p>
                </div>
              )}

              {/* Contact Form */}
              <form onSubmit={handleSubmit} noValidate className="space-y-5 flex-1 flex flex-col justify-between">
                
                {/* Row 1: Full Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      {isHi ? 'पूरा नाम' : 'Full Name'} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder={isHi ? 'उदा. राहुल सिंह' : 'e.g. Rahul Singh'}
                        className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-slate-50/50 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          touched.name && errors.name
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {touched.name && errors.name && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Mobile Field */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                      {isHi ? 'मोबाइल नंबर' : 'Mobile Number'} <span className="text-slate-400 text-xs font-normal">({isHi ? 'वैकल्पिक' : 'Optional'})</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          handleChange('phone', val);
                        }}
                        onBlur={() => handleBlur('phone')}
                        placeholder={isHi ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                        className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-slate-50/50 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                          touched.phone && errors.phone
                            ? 'border-red-400 focus:ring-red-200'
                            : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                        }`}
                      />
                    </div>
                    {touched.phone && errors.phone && (
                      <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    {isHi ? 'ईमेल पता' : 'Email Address'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder={isHi ? 'उदा. rahul@example.com' : 'e.g. rahul@example.com'}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-slate-50/50 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        touched.email && errors.email
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  {touched.email && errors.email && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.email}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    {isHi ? 'इस पते पर पावती एवं पत्राचार प्राप्त होगा।' : 'An acknowledgment receipt will be delivered to this email.'}
                  </p>
                </div>

                {/* Subject & Quick Suggestions */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5">
                    {isHi ? 'विषय / संदर्भ' : 'Subject / Topic'} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      onBlur={() => handleBlur('subject')}
                      placeholder={isHi ? 'उदा. वाहन ट्रैकिंग संबंधी पूछताछ' : 'e.g. Waste collection inquiry in Dharanaula'}
                      className={`w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border bg-slate-50/50 transition-all focus:bg-white focus:outline-none focus:ring-2 ${
                        touched.subject && errors.subject
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  {touched.subject && errors.subject && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.subject}
                    </p>
                  )}

                  {/* Quick Topics Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[11px] text-slate-400 font-medium mr-1">
                      {isHi ? 'त्वरित विषय:' : 'Quick Select:'}
                    </span>
                    {quickSubjects.map((subj, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          handleChange('subject', subj);
                          setTouched((prev) => ({ ...prev, subject: true }));
                        }}
                        className={`text-[11px] px-2.5 py-1 rounded-md transition-colors border ${
                          formData.subject === subj
                            ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        {subj}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Body */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700">
                      {isHi ? 'विस्तृत संदेश / विवरण' : 'Detailed Message / Description'} <span className="text-red-500">*</span>
                    </label>
                    <span className={`text-[11px] ${formData.message.length > 1900 ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                      {formData.message.length} / 2000
                    </span>
                  </div>
                  <div className="relative flex-1 flex flex-col">
                    <textarea
                      rows={5}
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      onBlur={() => handleBlur('message')}
                      placeholder={isHi ? 'अपनी समस्या, पूछताछ अथवा सुझाव का विस्तारपूर्वक विवरण यहाँ लिखें...' : 'Type your detailed inquiry, problem description, or feedback here...'}
                      className={`w-full flex-1 min-h-[140px] p-3.5 text-sm rounded-lg border bg-slate-50/50 transition-all focus:bg-white focus:outline-none focus:ring-2 resize-y ${
                        touched.message && errors.message
                          ? 'border-red-400 focus:ring-red-200'
                          : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'
                      }`}
                    />
                  </div>
                  {touched.message && errors.message && (
                    <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.message}
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 mt-auto">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-navy-900 hover:bg-navy-800 text-white font-bold px-8 h-12 text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{isHi ? 'संदेश भेजा जा रहा है...' : 'Sending Email...'}</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>{isHi ? 'संदेश प्रेषित करें' : 'Send Message Now'}</span>
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </div>

          {/* Right Column (5 cols): Officials Directory, Working Hours & Google Map */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* 1. Key Officials Directory */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-amber-600" />
                {isHi ? 'प्रमुख प्रशासनिक संपर्क' : 'Key Administrative Officers'}
              </h2>
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="font-bold text-navy-900 text-sm">Smt. Hema Gaira</p>
                  <p className="text-xs text-amber-700 font-semibold mb-1">
                    {isHi ? 'अध्यक्षा, जिला पंचायत अल्मोड़ा' : 'Chairperson, Zila Panchayat Almora'}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {isHi ? 'कार्यालय: जिला पंचायत भवन, धारानौला' : 'Office: Zila Panchayat Bhawan, Dharanaula'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <p className="font-bold text-navy-900 text-sm">Sh. Rajesh Kumar</p>
                  <p className="text-xs text-blue-700 font-semibold mb-1">
                    {isHi ? 'अपर मुख्य अधिकारी (AMA)' : 'Apar Mukhya Adhikari (AMA)'}
                  </p>
                  <p className="text-slate-500 text-xs">
                    {isHi ? 'सफाई नियंत्रण एवं वाहन प्रबंधन प्रकोष्ठ' : 'Sanitation Control & Fleet Monitoring Cell'}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Office Working Hours */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" />
                {isHi ? 'कार्यालय समय एवं कार्य दिवस' : 'Office Hours & Schedule'}
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">{isHi ? 'सोमवार से शनिवार' : 'Monday to Saturday'}</span>
                  <span className="font-semibold text-navy-900">10:00 AM – 05:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100">
                  <span className="text-slate-600">{isHi ? 'भोजनावकाश' : 'Lunch Break'}</span>
                  <span className="font-semibold text-slate-700">01:30 PM – 02:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-1.5 text-red-600">
                  <span>{isHi ? 'रविवार एवं राजकीय अवकाश' : 'Sunday & Gazetted Holidays'}</span>
                  <span className="font-semibold">{isHi ? 'कार्यालय बंद' : 'Closed'}</span>
                </div>
              </div>
            </div>

            {/* 3. Interactive Map */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[280px]">
              <div className="p-3.5 px-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-navy-900 text-xs sm:text-sm flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-red-600" />
                    {isHi ? 'कार्यालय भौगोलिक स्थान' : 'Office Location'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Dharanaula, Almora, Uttarakhand 263601
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild className="text-[11px] h-7 px-2.5">
                  <a 
                    href="https://maps.google.com/maps?q=Zila%20Panchayat%20Office,%20Dharanaula,%20Almora,%20Uttarakhand" 
                    target="_blank" 
                    rel="noreferrer"
                  >
                    {isHi ? 'मैप' : 'Map'} <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </Button>
              </div>

              <div className="flex-1 w-full relative bg-slate-100">
                <iframe
                  title="Zila Panchayat Almora Office Location"
                  src="https://maps.google.com/maps?q=Zila%20Panchayat%20Office,%20Dharanaula,%20Almora,%20Uttarakhand&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

          </div>

        </div>

        {/* ── Full-Width Bottom Section: State & Emergency Helplines ── */}
        <div className="mt-12 bg-gradient-to-br from-navy-950 via-navy-900 to-[#07182f] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-navy-800 relative overflow-hidden">
          
          {/* Top Tricolor Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-white to-emerald-600 opacity-90"></div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold font-poppins text-white">
                  {isHi ? 'उत्तराखंड राज्य एवं आपदा आपातकालीन हेल्पलाइन' : 'State & District 24×7 Emergency Helplines'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isHi 
                    ? 'नागरिकों की सुरक्षा, आपदा प्रबंधन एवं जनसहयोग हेतु चौबीसों घंटे सक्रिय आधिकारिक संपर्क'
                    : 'Round-the-clock official contacts for public safety, disaster management & emergency assistance'}
                </p>
              </div>
            </div>
          </div>

          {/* 6 Helpline Badges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            
            {/* CM Helpline */}
            <a 
              href="tel:1905" 
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 group block"
            >
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {isHi ? 'सीएम हेल्पलाइन' : 'CM Helpline'}
              </p>
              <p className="font-extrabold text-amber-300 text-lg font-mono tracking-wide mt-0.5">
                1905
              </p>
              <span className="text-[10px] text-slate-400">
                {isHi ? 'उत्तराखंड शासन' : 'Uttarakhand Govt'}
              </span>
            </a>

            {/* Disaster Management (DDMA Almora) */}
            <a 
              href="tel:1077" 
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 group block"
            >
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {isHi ? 'आपदा प्रबंधन' : 'DDMA Almora'}
              </p>
              <p className="font-extrabold text-amber-300 text-lg font-mono tracking-wide mt-0.5">
                1077
              </p>
              <span className="text-[10px] text-slate-400">
                {isHi ? 'आपदा नियंत्रण' : 'Disaster Control'}
              </span>
            </a>

            {/* Police Emergency */}
            <a 
              href="tel:112" 
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 group block"
            >
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {isHi ? 'पुलिस आपात सेवा' : 'Police Emergency'}
              </p>
              <p className="font-extrabold text-amber-300 text-lg font-mono tracking-wide mt-0.5">
                112
              </p>
              <span className="text-[10px] text-slate-400">
                {isHi ? 'सर्व आपातकालीन' : 'All Emergency'}
              </span>
            </a>

            {/* Ambulance */}
            <a 
              href="tel:108" 
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 group block"
            >
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {isHi ? 'एम्बुलेंस सेवा' : 'Ambulance'}
              </p>
              <p className="font-extrabold text-amber-300 text-lg font-mono tracking-wide mt-0.5">
                108
              </p>
              <span className="text-[10px] text-slate-400">
                {isHi ? 'चिकित्सा सेवा' : 'Medical Service'}
              </span>
            </a>

            {/* Women Helpline */}
            <a 
              href="tel:1090" 
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 group block"
            >
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {isHi ? 'महिला हेल्पलाइन' : 'Women Helpline'}
              </p>
              <p className="font-extrabold text-amber-300 text-lg font-mono tracking-wide mt-0.5">
                1090
              </p>
              <span className="text-[10px] text-slate-400">
                {isHi ? 'महिला सुरक्षा' : 'Women Safety'}
              </span>
            </a>

            {/* Childline */}
            <a 
              href="tel:1098" 
              className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400/50 hover:bg-white/10 transition-all duration-300 group block"
            >
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors">
                {isHi ? 'बाल सहायता (Childline)' : 'Child Helpline'}
              </p>
              <p className="font-extrabold text-amber-300 text-lg font-mono tracking-wide mt-0.5">
                1098
              </p>
              <span className="text-[10px] text-slate-400">
                {isHi ? 'बाल कल्याण' : 'Child Welfare'}
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
