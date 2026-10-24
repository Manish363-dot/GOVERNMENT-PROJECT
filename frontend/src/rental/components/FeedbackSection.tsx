import React, { useState } from 'react';
import { Send, CheckCircle2, MessageSquare, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const FeedbackSection: React.FC = () => {
  const { t, language } = useLanguage();
  const isHi = language === 'hi';

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [category, setCategory] = useState('maintenance');
  const [shopNo, setShopNo] = useState('');
  const [message, setMessage] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !mobile.trim() || !message.trim()) {
      alert(isHi ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const ref = `ZP-ALM/GRV/2026/${randomId}`;
    setSubmittedRef(ref);
    setName('');
    setMobile('');
    setShopNo('');
    setMessage('');
  };

  return (
    <section id="feedback" className="py-16 px-4 bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-bold text-[#1d4ed8] uppercase tracking-wider bg-blue-100/70 text-blue-800 px-3 py-1 rounded-full border border-blue-200">
            {t.feedback.tag}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0b1b36] tracking-tight">
            {t.feedback.title}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t.feedback.subtitle}
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
          {submittedRef ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {isHi ? 'आपकी शिकायत / सुझाव सफलतापूर्वक दर्ज कर लिया गया है।' : 'Grievance / Feedback Submitted Successfully!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {isHi ? 'आपकी संदर्भ संख्या (Tracking Reference ID):' : 'Your Tracking Reference ID:'}{' '}
                <span className="font-mono font-bold text-[#0b1b36] bg-white px-2.5 py-1 rounded border border-slate-300">
                  {submittedRef}
                </span>
              </p>
              <p className="text-xs text-slate-500 max-w-md mx-auto pt-2">
                {isHi
                  ? 'जिला पंचायत अल्मोड़ा के प्रशासनिक सेल द्वारा इसका परीक्षण कर 48 घंटों में आवश्यक कार्यवाही की जाएगी।'
                  : 'Administrative cell of Zila Panchayat Almora will review and process this within 48 hours.'}
              </p>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="mt-4 inline-flex items-center gap-1.5 bg-[#0b1b36] text-white px-4 py-2 rounded-lg text-xs font-bold cursor-pointer"
              >
                <span>{isHi ? 'नवीन सुझाव / शिकायत दर्ज करें' : 'Submit Another'}</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.feedback.nameLabel} *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isHi ? 'उदा. राकेश सिंह' : 'e.g. Rakesh Singh'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.feedback.mobileLabel} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="9876543210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.feedback.typeLabel}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="maintenance">
                      {isHi ? 'दुकान / परिसर की मरम्मत (Maintenance)' : 'Property Maintenance'}
                    </option>
                    <option value="cleanliness">
                      {isHi ? 'परिसर की साफ-सफाई (Cleanliness)' : 'Cleanliness / Sanitation'}
                    </option>
                    <option value="rent">
                      {isHi ? 'किराया या रसीद संबंधी (Rent & Receipt Issue)' : 'Rent & Receipt Issue'}
                    </option>
                    <option value="allotment">
                      {isHi ? 'आवंटन एवं नीलामी संबंधी (Allotment & Auction)' : 'Allotment & Auction Query'}
                    </option>
                    <option value="general">
                      {isHi ? 'अन्य सामान्य सुझाव (General Suggestion)' : 'General Suggestion'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.feedback.shopLabel}
                  </label>
                  <input
                    type="text"
                    value={shopNo}
                    onChange={(e) => setShopNo(e.target.value)}
                    placeholder={isHi ? 'उदा. SHOP-104 (यदि उपलब्ध हो)' : 'e.g. SHOP-104 (if applicable)'}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t.feedback.messageLabel} *
                </label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isHi
                      ? 'कृपया अपनी समस्या अथवा सुझाव का पूर्ण विवरण यहां लिखें...'
                      : 'Please describe your grievance or suggestion in detail...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="bg-[#0b1b36] hover:bg-[#152a4d] text-white font-bold px-6 py-2.5 rounded-lg text-xs sm:text-sm flex items-center justify-center gap-2 shadow cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{t.feedback.submitBtn}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
