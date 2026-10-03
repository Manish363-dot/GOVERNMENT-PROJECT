import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintService } from '@/services/complaint.service';
import {
  MessageSquareWarning, CheckCircle2, AlertCircle, ShieldCheck, Copy, Check,
  Search, Send, X, User, Phone, MapPin, FileCheck, KeyRound, RefreshCw, Smartphone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ComplaintTrack } from './ComplaintTrack';

function validateRealMobile(mobile: string): { valid: boolean; reason?: string } {
  const clean = mobile.replace(/\D/g, '');

  if (clean.length !== 10) {
    return { valid: false, reason: 'मोबाइल नंबर 10 अंकों का होना आवश्यक है / Mobile number must be 10 digits.' };
  }

  if (!/^[6-9]/.test(clean)) {
    return { valid: false, reason: 'वैध भारतीय मोबाइल नंबर 6, 7, 8 या 9 से शुरू होना चाहिए / Indian mobile numbers start with 6, 7, 8, or 9.' };
  }

  if (/^(\d)\1{9}$/.test(clean)) {
    return { valid: false, reason: 'अवैध मोबाइल नंबर। सभी समान अंक स्वीकार्य नहीं हैं / All identical digits are invalid.' };
  }

  const dummies = ['1234567890', '0123456789', '9876543210', '8765432109', '7654321098'];
  if (dummies.includes(clean)) {
    return { valid: false, reason: 'डमी/टेस्ट मोबाइल नंबर (उदा. 1234567890) स्वीकार्य नहीं हैं / Dummy test numbers are invalid.' };
  }

  return { valid: true };
}

type OtpStep = 'form' | 'otp_sent' | 'verified';

export const ComplaintForm = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState<'submit' | 'track'>('submit');

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    area: '',
    complaint_type: 'vehicle_not_arrived',
    description: '',
  });

  // OTP States
  const [otpStep, setOtpStep] = useState<OtpStep>('form');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null); // dev only
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // OTP Input refs for auto-focus
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<{
    complaint_number: string;
    name: string;
    mobile: string;
    area: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [trackQueryId, setTrackQueryId] = useState('');

  const complaintTypes = useMemo(() => [
    { value: 'vehicle_not_arrived', label: t('complaint.form.types.vehicle_not_arrived') },
    { value: 'garbage_not_collected', label: t('complaint.form.types.garbage_not_collected') },
    { value: 'other', label: t('complaint.form.types.other') },
  ], [t]);

  // ── Start Resend Countdown (60s) ──
  const startResendTimer = useCallback(() => {
    setResendTimer(60);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Send OTP Handler ──
  const handleSendOtp = useCallback(async () => {
    setOtpError(null);
    setOtpSuccess(null);

    if (!form.name.trim() || !form.mobile.trim() || !form.area.trim()) {
      setOtpError(isHi ? 'OTP भेजने से पहले नाम, मोबाइल और क्षेत्र भरें।' : 'Please fill Name, Mobile & Area before requesting OTP.');
      return;
    }

    const check = validateRealMobile(form.mobile);
    if (!check.valid) {
      setOtpError(check.reason!);
      return;
    }

    setOtpSending(true);
    try {
      const result = await complaintService.sendOtp({ mobile: form.mobile });
      setOtpStep('otp_sent');
      setOtp(['', '', '', '']);
      setDevOtp(result.devOtp || null);
      setOtpSuccess(result.message || (isHi ? `OTP भेजा गया +91 ${form.mobile} पर` : `OTP sent to +91 ${form.mobile}`));
      startResendTimer();
      // Auto-focus first OTP box
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err: any) {
      const msg: string = err.message || '';
      // If backend says "wait X seconds", sync our timer to server value
      const waitMatch = msg.match(/wait (\d+) second/i);
      if (waitMatch) {
        const serverWait = parseInt(waitMatch[1], 10);
        setResendTimer(serverWait);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setResendTimer(prev => {
            if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
            return prev - 1;
          });
        }, 1000);
        // Show clean bilingual message
        setOtpError(isHi
          ? `OTP पहले ही भेजा जा चुका है। ${serverWait} सेकंड बाद पुनः प्रयास करें।`
          : `OTP already sent. Please wait ${serverWait} seconds before resending.`
        );
      } else if (msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('maximum')) {
        // Rate limit hit
        setOtpError(isHi
          ? 'बहुत अधिक OTP अनुरोध। 1 घंटे बाद पुनः प्रयास करें।'
          : 'Too many OTP requests this hour. Please try again later.'
        );
      } else {
        setOtpError(msg || (isHi ? 'OTP भेजने में विफल। पुनः प्रयास करें।' : 'Failed to send OTP. Please try again.'));
      }
    } finally {
      setOtpSending(false);
    }
  }, [form, isHi, startResendTimer]);

  // ── OTP Box Key Handler ──
  const handleOtpChange = useCallback((index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError(null);
    if (digit && index < 3) {
      otpRefs.current[index + 1]?.focus();
    }
  }, [otp]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otp]);

  const handleOtpPaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (paste.length === 4) {
      setOtp(paste.split(''));
      otpRefs.current[3]?.focus();
    }
  }, []);

  // ── Complaint Submit Handler (after OTP verified) ──
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!form.name.trim() || !form.mobile.trim() || !form.area.trim()) {
      setError(isHi ? 'कृपया सभी अनिवार्य फ़ील्ड भरें।' : 'Please fill all required fields.');
      setLoading(false);
      return;
    }

    const check = validateRealMobile(form.mobile);
    if (!check.valid) {
      setError(check.reason!);
      setLoading(false);
      return;
    }

    const otpValue = otp.join('');
    if (otpValue.length !== 4) {
      setError(isHi ? 'कृपया 4-अंकीय OTP कोड दर्ज करें।' : 'Please enter the 4-digit OTP code.');
      setLoading(false);
      return;
    }

    try {
      const result = await complaintService.create({ ...form, otp: otpValue });
      setSuccess(result.complaint_number);
      setLastSubmitted({
        complaint_number: result.complaint_number,
        name: form.name,
        mobile: form.mobile,
        area: form.area,
      });
      setTrackQueryId(result.complaint_number);
      setForm({ name: '', mobile: '', area: '', complaint_type: 'vehicle_not_arrived', description: '' });
      setOtp(['', '', '', '']);
      setOtpStep('form');
      setDevOtp(null);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err: any) {
      setError(err.message || t('complaint.form.errorSubmit'));
    } finally {
      setLoading(false);
    }
  }, [form, otp, isHi, t]);

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  const handleTrackNow = useCallback((id: string) => {
    setTrackQueryId(id);
    setActiveTab('track');
  }, []);

  const handleResetOtp = useCallback(() => {
    setOtpStep('form');
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
    setOtpSuccess(null);
    setDevOtp(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setResendTimer(0);
  }, []);

  return (
    <section id="complaint" className="py-10 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">

          {/* ── Left Column: Info + Official Receipt Card ── */}
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-200">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                {t('complaint.info.badge')}
              </div>

              <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
                {t('complaint.title')}
              </h2>
              <p className="text-slate-600 mb-6 leading-relaxed text-sm sm:text-base">
                {t('complaint.subtitle')}
              </p>
            </div>

            {/* Steps List */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-7 h-7 rounded bg-navy-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">{t('complaint.info.step1Title')}</p>
                  <p className="text-[11px] text-slate-500">{t('complaint.info.step1Desc')}</p>
                </div>
              </div>

              {/* OTP Step */}
              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-7 h-7 rounded bg-blue-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">
                    {isHi ? 'OTP सत्यापन' : 'OTP Verification'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isHi
                      ? 'मोबाइल नंबर सत्यापित करने के लिए एकबारी पासवर्ड (OTP) दर्ज करें।'
                      : 'Enter the One-Time Password sent to your mobile to verify your identity.'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-7 h-7 rounded bg-emerald-700 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">{t('complaint.info.step2Title')}</p>
                  <p className="text-[11px] text-slate-500">{t('complaint.info.step2Desc')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-7 h-7 rounded bg-amber-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">{t('complaint.info.step3Title')}</p>
                  <p className="text-[11px] text-slate-500">{t('complaint.info.step3Desc')}</p>
                </div>
              </div>
            </div>

            {/* ── Official Receipt Card ── */}
            {success && lastSubmitted && (
              <div className="animate-fade-in bg-white border border-slate-300 rounded-lg shadow-sm border-l-4 border-l-navy-900 overflow-hidden text-slate-800">
                {/* Official Header */}
                <div className="bg-navy-900 text-white p-2.5 px-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200 font-mono">
                      {isHi ? 'प्रमाणित शिकायत रसीद' : 'OFFICIAL GRIEVANCE RECEIPT'}
                    </span>
                  </div>
                  <button
                    onClick={() => { setSuccess(null); setLastSubmitted(null); }}
                    className="text-slate-300 hover:text-white transition-colors p-0.5"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Body */}
                <div className="p-3.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <p className="font-bold text-navy-900 text-xs sm:text-sm">
                      {isHi ? 'शिकायत सफलतापूर्वक पंजीकृत हुई' : 'Complaint Registered Successfully'}
                    </p>
                  </div>

                  {/* Complaint ID Box */}
                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] font-bold uppercase text-slate-500 block tracking-wider">
                        {isHi ? 'शिकायत संख्या' : 'REFERENCE NO.'}
                      </span>
                      <span className="font-mono text-base font-extrabold text-navy-900 tracking-wider">
                        {lastSubmitted.complaint_number}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyId(lastSubmitted.complaint_number)}
                      className={`h-7 px-2.5 text-[11px] gap-1 font-semibold transition-all ${copied
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3" />
                          {isHi ? 'कॉपी' : 'Copied'}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          {isHi ? 'कॉपी ID' : 'Copy ID'}
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Citizen Metadata Row */}
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-0.5">
                    <div className="flex items-center gap-1.5 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-medium text-navy-900 truncate">{lastSubmitted.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{lastSubmitted.mobile}</span>
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{lastSubmitted.area}</span>
                    </div>
                  </div>

                  {/* Track Action Button */}
                  <Button
                    type="button"
                    onClick={() => handleTrackNow(lastSubmitted.complaint_number)}
                    className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold h-8 text-xs uppercase tracking-wider gap-1.5 shadow-xs mt-1"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    {isHi ? 'ट्रैक करें →' : 'Track Status Now →'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Form & Tracking Card ── */}
          <Card className="shadow-md border border-slate-200 bg-white rounded-lg overflow-hidden">
            {/* Header with Tab Navigation */}
            <CardHeader className="bg-navy-900 text-white p-0 border-b border-navy-800">
              <div className="p-4 sm:p-5 flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">{t('complaint.title')}</CardTitle>
                  <CardDescription className="text-xs text-slate-300">{t('complaint.portalSub')}</CardDescription>
                </div>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 bg-navy-950 border-t border-navy-800 divide-x divide-navy-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('submit')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'submit'
                    ? 'bg-amber-500 text-navy-950 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  {isHi ? 'शिकायत दर्ज करें' : 'Lodge Complaint'}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('track')}
                  className={`py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === 'track'
                    ? 'bg-amber-500 text-navy-950 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-navy-900'
                    }`}
                >
                  <Search className="w-3.5 h-3.5" />
                  {isHi ? 'शिकायत ट्रैक करें' : 'Track Complaint'}
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              {activeTab === 'submit' ? (
                <>
                  {/* Error Alert */}
                  {error && (
                    <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-xs font-medium leading-relaxed">{error}</p>
                    </div>
                  )}

                  {/* ══ STEP 1 — OTP NOT YET SENT: Main Form ══ */}
                  {otpStep === 'form' && (
                    <form className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs font-semibold text-navy-900">{t('complaint.form.name')} *</Label>
                        <Input
                          id="name"
                          placeholder={t('complaint.form.namePlaceholder')}
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className="border-slate-300 focus:border-navy-900 h-11 text-base sm:text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <Label htmlFor="mobile" className="text-xs font-semibold text-navy-900">{t('complaint.form.mobile')} *</Label>
                          <span className="text-[10px] text-slate-500 font-mono">10-Digit Mobile</span>
                        </div>
                        <Input
                          id="mobile"
                          placeholder={t('complaint.form.mobilePlaceholder')}
                          value={form.mobile}
                          onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                          className="border-slate-300 focus:border-navy-900 h-11 text-base sm:text-sm font-mono"
                          required
                          maxLength={10}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="area" className="text-xs font-semibold text-navy-900">{t('complaint.form.area')} *</Label>
                        <Input
                          id="area"
                          placeholder={t('complaint.form.areaPlaceholder')}
                          value={form.area}
                          onChange={(e) => setForm({ ...form, area: e.target.value })}
                          className="border-slate-300 focus:border-navy-900 h-11 text-base sm:text-sm"
                          required
                        />
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="complaint_type" className="text-xs font-semibold text-navy-900">{t('complaint.form.type')} *</Label>
                        <select
                          id="complaint_type"
                          value={form.complaint_type}
                          onChange={(e) => setForm({ ...form, complaint_type: e.target.value })}
                          className="flex h-11 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base sm:text-sm text-navy-900 focus:border-navy-900 focus:outline-none"
                          required
                        >
                          {complaintTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="description" className="text-xs font-semibold text-navy-900">{t('complaint.form.description')}</Label>
                        <Textarea
                          id="description"
                          placeholder={t('complaint.form.descriptionPlaceholder')}
                          value={form.description}
                          onChange={(e) => setForm({ ...form, description: e.target.value })}
                          className="border-slate-300 focus:border-navy-900 text-base sm:text-sm"
                          rows={3}
                        />
                      </div>

                      {/* OTP Error */}
                      {otpError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-red-800 text-xs leading-relaxed">{otpError}</p>
                        </div>
                      )}

                      {/* Get OTP Button */}
                      <Button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                        className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold h-12 text-sm uppercase tracking-wide gap-2"
                        size="lg"
                      >
                        {otpSending ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {isHi ? 'OTP भेजा जा रहा है...' : 'Sending OTP...'}
                          </span>
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4 text-blue-200" />
                            {isHi ? 'OTP प्राप्त करें' : 'Get OTP on Mobile'}
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {/* ══ STEP 2 — OTP SENT: OTP Entry Panel ══ */}
                  {otpStep === 'otp_sent' && (
                    <form onSubmit={handleSubmit} className="space-y-5">

                      {/* OTP Sent Banner */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <Smartphone className="w-4 h-4 text-blue-700" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900 text-xs">
                            {isHi ? 'OTP भेजा गया!' : 'OTP Sent!'}
                          </p>
                          <p className="text-blue-700 text-[11px] mt-0.5">
                            {otpSuccess || (isHi ? `+91 ${form.mobile} पर 4-अंकीय कोड भेजा।` : `4-digit code sent to +91 ${form.mobile}`)}
                          </p>
                          {/* Dev OTP hint */}
                          {devOtp && (
                            <p className="mt-1 text-[11px] font-mono bg-yellow-100 border border-yellow-300 rounded px-2 py-0.5 text-yellow-900 inline-block">
                              🔧 Dev OTP: <strong>{devOtp}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* 4-Box OTP Input */}
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-navy-900 flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5 text-navy-700" />
                          {isHi ? '4-अंकीय OTP कोड दर्ज करें' : 'Enter 4-Digit OTP Code'}
                        </Label>

                        <div className="flex gap-2 justify-center">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              ref={(el) => { otpRefs.current[index] = el; }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(index, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={handleOtpPaste}
                              className={`w-11 h-13 text-center text-xl font-bold font-mono rounded-lg border-2 transition-all outline-none
                                ${digit
                                  ? 'border-navy-900 bg-navy-50 text-navy-900'
                                  : 'border-slate-300 bg-white text-slate-800'
                                }
                                focus:border-blue-600 focus:ring-2 focus:ring-blue-100`}
                              style={{ height: '3.25rem' }}
                            />
                          ))}
                        </div>

                        {/* Resend Timer */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            onClick={handleResetOtp}
                            className="text-[11px] text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
                          >
                            <X className="w-3 h-3" />
                            {isHi ? 'मोबाइल बदलें' : 'Change Mobile'}
                          </button>

                          {resendTimer > 0 ? (
                            <span className="text-[11px] text-slate-500 font-mono">
                              {isHi ? `पुनः भेजें ${resendTimer}s में` : `Resend in ${resendTimer}s`}
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={otpSending}
                              className="text-[11px] text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <RefreshCw className="w-3 h-3" />
                              {isHi ? 'OTP पुनः भेजें' : 'Resend OTP'}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Readonly Summary */}
                      <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 space-y-1.5 text-[11px] text-slate-600">
                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                          {isHi ? 'शिकायत सारांश' : 'Complaint Summary'}
                        </p>
                        <div className="flex items-center gap-2">
                          <User className="w-3 h-3 text-slate-400" />
                          <span className="font-medium text-navy-900">{form.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">+91 {form.mobile}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{form.area}</span>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold h-12 text-sm uppercase tracking-wide gap-2"
                        size="lg"
                        disabled={loading || otp.join('').length !== 4}
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            {t('complaint.form.submitting')}
                          </span>
                        ) : (
                          <>
                            <Send className="w-4 h-4 text-amber-400" />
                            {t('complaint.form.submit')}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </>
              ) : (
                <ComplaintTrack initialId={trackQueryId} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
});
