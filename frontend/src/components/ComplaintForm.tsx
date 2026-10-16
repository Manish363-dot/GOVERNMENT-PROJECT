import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { complaintService } from '@/services/complaint.service';
import { 
  MessageSquareWarning, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  Search, 
  Send, 
  X, 
  User, 
  Phone, 
  MapPin, 
  Building2,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  ShieldCheck,
  Paperclip,
  ExternalLink,
  MessageCircle,
  KeyRound,
  RefreshCw
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

export const ALMORA_BLOCKS = [
  { value: 'Hawalbagh', nameHi: 'हवालबाग (Hawalbagh)', nameEn: 'Hawalbagh' },
  { value: 'Tarikhet', nameHi: 'ताड़ीखेत (Tarikhet)', nameEn: 'Tarikhet' },
  { value: 'Dwarahat', nameHi: 'द्वाराहाट (Dwarahat)', nameEn: 'Dwarahat' },
  { value: 'Chaukhutiya', nameHi: 'चौखुटिया (Chaukhutiya)', nameEn: 'Chaukhutiya' },
  { value: 'Bhikiyasain', nameHi: 'भिकियासैंण (Bhikiyasain)', nameEn: 'Bhikiyasain' },
  { value: 'Sult', nameHi: 'सल्ट (Sult)', nameEn: 'Sult' },
  { value: 'Syalde', nameHi: 'स्याल्दे (Syalde)', nameEn: 'Syalde' },
  { value: 'Bhaisiyachhana', nameHi: 'भैसियाछाना (Bhaisiyachhana)', nameEn: 'Bhaisiyachhana' },
  { value: 'Dhauladevi', nameHi: 'धौलादेवी (Dhauladevi)', nameEn: 'Dhauladevi' },
  { value: 'Lamgara', nameHi: 'लमगड़ा (Lamgara)', nameEn: 'Lamgara' },
  { value: 'Takula', nameHi: 'ताकुला (Takula)', nameEn: 'Takula' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

export interface ComplaintFormProps {
  initialTab?: 'submit' | 'track';
  onTabChange?: (tab: 'submit' | 'track') => void;
}

export const ComplaintForm: React.FC<ComplaintFormProps> = React.memo(({
  initialTab = 'submit',
  onTabChange
}) => {
  const { i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [activeTab, setActiveTab] = useState<'submit' | 'track'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const switchTab = useCallback((tab: 'submit' | 'track') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  const [form, setForm] = useState({
    name: '',
    mobile: '',
    block: 'Hawalbagh',
    area: '',
    complaint_type: 'vehicle_not_arrived',
    description: '',
  });

  // File Upload State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Citizen Declaration State
  const [declarationAccepted, setDeclarationAccepted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [lastSubmitted, setLastSubmitted] = useState<{
    complaint_number: string;
    name: string;
    mobile: string;
    block: string;
    area: string;
    fileName?: string;
    attachment_url?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [trackQueryId, setTrackQueryId] = useState('');

  // Real-time Field-level Validation States
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // WhatsApp OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const validateField = useCallback((field: string, value: any): string => {
    let err = '';
    if (field === 'name') {
      const v = typeof value === 'string' ? value.trim() : '';
      if (!v) {
        err = isHi ? 'शिकायतकर्ता का नाम दर्ज करना अनिवार्य है।' : 'Citizen full name is required.';
      } else if (v.length < 2) {
        err = isHi ? 'नाम कम से कम 2 अक्षरों का होना चाहिए।' : 'Name must be at least 2 characters.';
      }
    } else if (field === 'mobile') {
      const v = typeof value === 'string' ? value : '';
      if (!v.trim()) {
        err = isHi ? '10-अंकीय मोबाइल नंबर दर्ज करना अनिवार्य है।' : '10-digit mobile number is required.';
      } else {
        const check = validateRealMobile(v);
        if (!check.valid) {
          err = check.reason || (isHi ? 'अवैध मोबाइल नंबर।' : 'Invalid mobile number.');
        }
      }
    } else if (field === 'area') {
      const v = typeof value === 'string' ? value.trim() : '';
      if (!v) {
        err = isHi ? 'ग्राम पंचायत / वार्ड / मोहल्ला / स्थान दर्ज करना अनिवार्य है।' : 'Area / Ward / Location is required.';
      } else if (v.length < 2) {
        err = isHi ? 'स्थान का विवरण कम से कम 2 अक्षरों का होना चाहिए।' : 'Location must be at least 2 characters.';
      }
    } else if (field === 'declaration') {
      if (!value) {
        err = isHi
          ? 'शिकायत प्रेषित करने से पूर्व नागरिक स्व-घोषणा स्वीकार करना अनिवार्य है।'
          : 'Citizen Self-Declaration must be accepted before submitting.';
      }
    }
    setFieldErrors((prev) => ({ ...prev, [field]: err }));
    return err;
  }, [isHi]);

  const complaintTypes = useMemo(() => [
    { value: 'vehicle_not_arrived', label: isHi ? 'कचरा संग्रहण गाड़ी नहीं आई (Vehicle Not Arrived)' : 'Vehicle Did Not Arrive' },
    { value: 'garbage_not_collected', label: isHi ? 'कचरा नहीं उठाया गया (Garbage Not Collected)' : 'Garbage Not Collected' },
    { value: 'other', label: isHi ? 'अन्य सफाई / कचरा समस्या (Other Sanitation Issue)' : 'Other Sanitation Issue' },
  ], [isHi]);

  // File selection & validation handler
  const handleProcessFile = useCallback((file: File) => {
    setFileError(null);

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = ALLOWED_EXTENSIONS.includes(ext);
    const isMimeValid = file.type === 'application/pdf' || 
                         file.type === 'image/jpeg' || 
                         file.type === 'image/png' || 
                         file.type === 'image/jpg';

    if (!isExtensionValid && !isMimeValid) {
      setFileError(
        isHi
          ? 'अमान्य फ़ाइल प्रारूप! केवल JPG, PNG, JPEG या PDF फ़ाइलें ही स्वीकार्य हैं।'
          : 'Invalid file format! Only JPG, PNG, JPEG, and PDF files are allowed.'
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      setFileError(
        isHi
          ? `फ़ाइल का आकार 5 MB की सीमा से अधिक है (${sizeMb} MB)। कृपया 5 MB से कम आकार की फ़ाइल चुनें।`
          : `File size exceeds 5 MB limit (${sizeMb} MB). Please choose a file under 5 MB.`
      );
      return;
    }

    // Revoke previous URL if any
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }

    setAttachedFile(file);
    if (file.type.startsWith('image/')) {
      setFilePreviewUrl(URL.createObjectURL(file));
    } else {
      setFilePreviewUrl(null);
    }
  }, [filePreviewUrl, isHi]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = useCallback(() => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setAttachedFile(null);
    setFilePreviewUrl(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [filePreviewUrl]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  // Direct Complaint Submission Handler
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Mark all required fields as touched
    setTouched({
      name: true,
      mobile: true,
      area: true,
      declaration: true,
    });

    const errName = validateField('name', form.name);
    const errMobile = validateField('mobile', form.mobile);
    const errArea = validateField('area', form.area);
    const errDecl = validateField('declaration', declarationAccepted);

    if (errName || errMobile || errArea || errDecl) {
      const firstError = errName || errMobile || errArea || errDecl;
      setError(firstError);
      if (errName) document.getElementById('complaint-name')?.focus();
      else if (errMobile) document.getElementById('complaint-mobile')?.focus();
      else if (errArea) document.getElementById('complaint-area')?.focus();
      else if (errDecl) document.getElementById('citizen-declaration')?.focus();
      return;
    }

    if (fileError) {
      setError(fileError);
      return;
    }

    if (!otpVerified) {
      const verifyMsg = isHi
        ? 'कृपया शिकायत प्रेषित करने से पूर्व अपने मोबाइल नंबर को WhatsApp OTP द्वारा सत्यापित करें।'
        : 'Please verify your mobile number via WhatsApp OTP before submitting the complaint.';
      setError(verifyMsg);
      document.getElementById('complaint-mobile')?.focus();
      return;
    }

    setLoading(true);

    // Combine Almora block and specific area/ward into the area field
    const combinedArea = `${form.area.trim()} (ब्लॉक: ${form.block})`;

    try {
      let uploadedS3Url: string | null = null;
      if (attachedFile) {
        // Upload directly to Amazon S3
        const uploadRes = await complaintService.uploadAttachment(attachedFile);
        uploadedS3Url = uploadRes.url;
      }

      // Prepare description with file metadata & verified declaration
      let finalDescription = form.description.trim();
      if (attachedFile) {
        const fileInfo = `[संलग्न दस्तावेज: ${attachedFile.name} (${(attachedFile.size / (1024 * 1024)).toFixed(2)} MB)]`;
        finalDescription = finalDescription ? `${finalDescription}\n\n${fileInfo}` : fileInfo;
      }
      const declarationNotice = `[नागरिक स्व-घोषणा: आवेदक द्वारा सत्यता प्रमाणित]`;
      finalDescription = finalDescription ? `${finalDescription}\n${declarationNotice}` : declarationNotice;

      const result = await complaintService.create({
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        area: combinedArea,
        complaint_type: form.complaint_type,
        description: finalDescription,
        attachment_url: uploadedS3Url,
      });

      setSuccess(result.complaint_number);
      setLastSubmitted({
        complaint_number: result.complaint_number,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        block: form.block,
        area: form.area.trim(),
        fileName: attachedFile ? attachedFile.name : undefined,
        attachment_url: uploadedS3Url || undefined,
      });
      setTrackQueryId(result.complaint_number);

      // Reset form & validation states
      setForm({
        name: '',
        mobile: '',
        block: 'Hawalbagh',
        area: '',
        complaint_type: 'vehicle_not_arrived',
        description: '',
      });
      handleRemoveFile();
      setDeclarationAccepted(false);
      setTouched({});
      setFieldErrors({});
      setOtpSent(false);
      setEnteredOtp('');
      setOtpVerified(false);
      setDevOtpHint(null);
      setOtpMessage(null);
      setOtpError(null);
    } catch (err: any) {
      console.error('Failed to submit complaint:', err);
      setError(err.message || (isHi ? 'शिकायत दर्ज करने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to register complaint. Please try again.'));
    } finally {
      setLoading(false);
    }
  }, [form, attachedFile, declarationAccepted, isHi, validateField, handleRemoveFile, fileError, otpVerified]);

  const handleSendWhatsAppOtp = useCallback(async () => {
    setOtpError(null);
    setOtpMessage(null);
    setDevOtpHint(null);

    const check = validateRealMobile(form.mobile);
    if (!check.valid) {
      setFieldErrors((prev) => ({ ...prev, mobile: check.reason || 'अमान्य मोबाइल नंबर' }));
      return;
    }

    setOtpLoading(true);
    try {
      const res = await complaintService.sendOtp(form.mobile);
      setOtpSent(true);
      setOtpMessage(res.message);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
      }
      setResendCountdown(60);
    } catch (err: any) {
      setOtpError(err.message || (isHi ? 'OTP भेजने में विफल। कृपया पुनः प्रयास करें।' : 'Failed to send OTP. Please try again.'));
    } finally {
      setOtpLoading(false);
    }
  }, [form.mobile, isHi]);

  const handleVerifyWhatsAppOtp = useCallback(async () => {
    if (enteredOtp.trim().length !== 6) {
      setOtpError(isHi ? 'कृपया 6 अंकों का सुरक्षा OTP दर्ज करें।' : 'Please enter 6-digit OTP.');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    try {
      await complaintService.verifyOtp(form.mobile, enteredOtp.trim());
      setOtpVerified(true);
      setOtpMessage(isHi ? 'WhatsApp नंबर सफलतापूर्वक सत्यापित हो गया!' : 'WhatsApp number verified successfully!');
      setDevOtpHint(null);
    } catch (err: any) {
      setOtpError(err.message || (isHi ? 'गलत OTP दर्ज किया गया है।' : 'Invalid OTP code.'));
    } finally {
      setOtpLoading(false);
    }
  }, [form.mobile, enteredOtp, isHi]);

  const handleOpenWhatsAppReceipt = useCallback((complaintNumber: string, area: string, name: string, phone: string) => {
    const trackingUrl = `${window.location.origin}/complaints?tab=track&query=${complaintNumber}`;
    const text = 
`🏛️ *ग्राम पंचायत - नागरिक स्वच्छता शिकायत पावती*
━━━━━━━━━━━━━━━━━━━━━━━━
📋 *शिकायत संख्या:* #${complaintNumber}
👤 *शिकायतकर्ता:* ${name}
📞 *सत्यापित मोबाइल:* +91 ${phone}
📍 *स्थान / वार्ड:* ${area}
📅 *तारीख:* ${new Date().toLocaleDateString('hi-IN')}

🔗 *लाइव ट्रैकिंग लिंक:*
${trackingUrl}
━━━━━━━━━━━━━━━━━━━━━━━━
_यह पावती भविष्य के संदर्भ के लिए सुरक्षित रखें।_`;

    const waUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  }, []);

  const handleCopyId = useCallback((id: string) => {
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }, []);

  const handleTrackNow = useCallback((id: string) => {
    setTrackQueryId(id);
    switchTab('track');
  }, [switchTab]);

  return (
    <section id="complaint" className="py-2 sm:py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Top Tricolor Accent Line */}
          <div className="h-1.5 bg-gradient-to-r from-amber-500 via-white to-emerald-600 border-b border-slate-200" />

          {/* Interactive Tab Switcher Header */}
          <div className="bg-navy-950 p-2 sm:p-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => switchTab('submit')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'submit'
                  ? 'bg-amber-500 text-navy-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isHi ? 'शिकायत दर्ज करें' : 'Lodge Complaint'}</span>
            </button>

            <button
              type="button"
              onClick={() => switchTab('track')}
              className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'track'
                  ? 'bg-amber-500 text-navy-950 shadow-md font-extrabold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{isHi ? 'शिकायत ट्रैक करें' : 'Track Status'}</span>
            </button>
          </div>

          <div className="p-6 sm:p-8 md:p-10">
            {activeTab === 'submit' ? (
              <>
                {/* Official Receipt Banner on Submit Success */}
                {success && lastSubmitted && (
                  <div className="mb-8 bg-emerald-50/70 border border-emerald-300 rounded-2xl p-5 sm:p-6 animate-fade-in text-emerald-950 shadow-xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-base sm:text-lg text-emerald-900 leading-tight">
                            {isHi ? 'शिकायत सफलतापूर्वक दर्ज हो गई है!' : 'Complaint Registered Successfully!'}
                          </h3>
                          <p className="text-xs text-emerald-700 mt-0.5">
                            {isHi 
                              ? 'जिला पंचायत अल्मोड़ा के संबंधित सफाई प्रकोष्ठ को अग्रेषित की जा चुकी है।' 
                              : 'Forwarded to the sanitation monitoring cell of Zila Panchayat Almora.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { setSuccess(null); setLastSubmitted(null); }}
                        className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
                        title={isHi ? 'बंद करें' : 'Close'}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-4 pt-4 border-t border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 p-4 rounded-xl border border-emerald-200">
                      <div>
                        <span className="font-mono text-lg sm:text-xl font-extrabold text-navy-900 tracking-wider">
                          {lastSubmitted.complaint_number}
                        </span>
                        <div className="text-xs text-slate-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span><strong>{isHi ? 'नागरिक:' : 'Citizen:'}</strong> {lastSubmitted.name}</span>
                          <span>•</span>
                          <span><strong>{isHi ? 'ब्लॉक:' : 'Block:'}</strong> {lastSubmitted.block}</span>
                          <span>•</span>
                          <span><strong>{isHi ? 'स्थान:' : 'Area:'}</strong> {lastSubmitted.area}</span>
                          {lastSubmitted.fileName && (
                            <>
                              <span>•</span>
                              <span><strong>{isHi ? 'संलग्न साक्ष्य:' : 'Attachment:'}</strong> {lastSubmitted.fileName}</span>
                            </>
                          )}
                          {lastSubmitted.attachment_url && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 font-bold text-emerald-800">
                                <Paperclip className="w-3 h-3" />
                                <span>{isHi ? 'AWS S3 पर अपलोड प्रमाणित' : 'Verified AWS S3 Upload'}</span>
                              </span>
                            </>
                          )}
                        </div>

                        {lastSubmitted.attachment_url && (
                          <div className="mt-3 p-2 bg-white/80 border border-emerald-200 rounded-md inline-block max-w-full">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                              {isHi ? 'अपलोड किया गया साक्ष्य (Uploaded Evidence):' : 'Uploaded Evidence:'}
                            </span>
                            {/\.(jpg|jpeg|png|webp|gif)($|\?)/i.test(lastSubmitted.attachment_url) ? (
                              <img
                                src={lastSubmitted.attachment_url}
                                alt="Uploaded Attachment"
                                className="max-h-52 w-auto max-w-full object-contain rounded border border-slate-200 bg-slate-50"
                                loading="lazy"
                              />
                            ) : (
                              <iframe
                                src={lastSubmitted.attachment_url}
                                className="w-full h-64 rounded border border-slate-200 bg-white"
                                title="Uploaded Document"
                              />
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyId(lastSubmitted.complaint_number)}
                          className={`h-9 px-3 text-xs font-semibold cursor-pointer ${
                            copied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300'
                          }`}
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 mr-1" />
                              {isHi ? 'कॉपी हो गया' : 'Copied'}
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              {isHi ? 'आईडी कॉपी करें' : 'Copy ID'}
                            </>
                          )}
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() => handleTrackNow(lastSubmitted.complaint_number)}
                          className="bg-navy-900 hover:bg-navy-800 text-white font-bold h-9 px-4 text-xs gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Search className="w-3.5 h-3.5 text-amber-400" />
                          <span>{isHi ? 'स्थिति ट्रैक करें' : 'Track Status'}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Redesigned Full-Width Form */}
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  
                  {/* Row 1: Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="complaint-name" className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isHi ? 'शिकायतकर्ता का पूरा नाम' : 'Full Name of Citizen'}</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="complaint-name"
                        placeholder={isHi ? 'उदा. हरीश सिंह रावत' : 'e.g. Harish Singh Rawat'}
                        value={form.name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => ({ ...prev, name: val }));
                          if (touched.name) validateField('name', val);
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, name: true }));
                          validateField('name', form.name);
                        }}
                        className={`h-11 text-sm rounded-xl transition-colors ${
                          touched.name && fieldErrors.name
                            ? 'border-red-400 bg-red-50/25 focus:border-red-500 focus:ring-red-100'
                            : touched.name && !fieldErrors.name && form.name.trim().length >= 2
                            ? 'border-emerald-500 bg-white'
                            : 'bg-slate-50/50 border-slate-300 focus:bg-white focus:border-navy-900'
                        }`}
                        required
                      />
                      {touched.name && fieldErrors.name && (
                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.name}</span>
                        </p>
                      )}
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="complaint-mobile" className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{isHi ? 'मोबाइल नंबर' : 'Mobile Number'}</span>
                          <span className="text-red-500">*</span>
                        </Label>
                        <span className="text-[10px] text-slate-400 font-mono">10-Digit Mobile</span>
                      </div>
                      <Input
                        id="complaint-mobile"
                        placeholder={isHi ? 'उदा. 9876543210' : 'e.g. 9876543210'}
                        value={form.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setForm((prev) => ({ ...prev, mobile: val }));
                          if (otpVerified) setOtpVerified(false);
                          if (otpSent) setOtpSent(false);
                          if (val.length === 10 || touched.mobile) {
                            validateField('mobile', val);
                          } else if (fieldErrors.mobile) {
                            setFieldErrors((prev) => ({ ...prev, mobile: '' }));
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, mobile: true }));
                          validateField('mobile', form.mobile);
                        }}
                        className={`h-11 text-sm rounded-xl font-mono transition-colors ${
                          touched.mobile && fieldErrors.mobile
                            ? 'border-red-400 bg-red-50/25 focus:border-red-500 focus:ring-red-100'
                            : otpVerified
                            ? 'border-emerald-500 bg-emerald-50/30 font-bold'
                            : form.mobile.length === 10 && !fieldErrors.mobile
                            ? 'border-emerald-500 bg-white'
                            : 'bg-slate-50/50 border-slate-300 focus:bg-white focus:border-navy-900'
                        }`}
                        required
                        maxLength={10}
                      />
                      {touched.mobile && fieldErrors.mobile && (
                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.mobile}</span>
                        </p>
                      )}

                      {/* WhatsApp OTP Verification Widget */}
                      {form.mobile.length === 10 && !fieldErrors.mobile && (
                        <div className="mt-2 animate-fade-in">
                          {otpVerified ? (
                            <div className="py-2 px-3 bg-emerald-100/90 border border-emerald-300 text-emerald-900 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                <span>{isHi ? 'WhatsApp नंबर सफलतापूर्वक सत्यापित है' : 'WhatsApp Number Verified'}</span>
                              </span>
                              <span className="text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                                Verified ✓
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {!otpSent ? (
                                <button
                                  type="button"
                                  onClick={handleSendWhatsAppOtp}
                                  disabled={otpLoading}
                                  className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                                >
                                  <MessageCircle className="w-4 h-4 text-white" />
                                  <span>
                                    {otpLoading
                                      ? (isHi ? 'WhatsApp पर OTP भेजा जा रहा है...' : 'Sending WhatsApp OTP...')
                                      : (isHi ? '📱 WhatsApp पर OTP भेजें (Verify Number)' : '📱 Send OTP on WhatsApp')}
                                  </span>
                                </button>
                              ) : (
                                <div className="p-3 bg-emerald-50/80 border border-emerald-300 rounded-xl space-y-2.5">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-bold text-emerald-950 flex items-center gap-1">
                                      <KeyRound className="w-3.5 h-3.5 text-emerald-700" />
                                      <span>{isHi ? 'WhatsApp 6-अंकीय OTP दर्ज करें:' : 'Enter 6-digit WhatsApp OTP:'}</span>
                                    </span>
                                    {resendCountdown > 0 ? (
                                      <span className="text-[10px] text-slate-500 font-mono">
                                        {isHi ? `पुनः भेजें (${resendCountdown}s)` : `Resend (${resendCountdown}s)`}
                                      </span>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={handleSendWhatsAppOtp}
                                        disabled={otpLoading}
                                        className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold underline cursor-pointer"
                                      >
                                        {isHi ? 'पुनः OTP भेजें' : 'Resend OTP'}
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="text"
                                      maxLength={6}
                                      placeholder="123456"
                                      value={enteredOtp}
                                      onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                      className="h-10 text-center font-mono font-extrabold tracking-widest text-base bg-white border-emerald-400 focus:ring-emerald-500"
                                    />
                                    <Button
                                      type="button"
                                      size="sm"
                                      disabled={otpLoading || enteredOtp.length !== 6}
                                      onClick={handleVerifyWhatsAppOtp}
                                      className="h-10 px-5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                                    >
                                      {otpLoading ? (isHi ? 'जांच...' : 'Verifying...') : (isHi ? 'वेरीफाई करें' : 'Verify')}
                                    </Button>
                                  </div>

                                  {devOtpHint && (
                                    <div className="text-[11px] bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200 flex items-center justify-between">
                                      <span>💡 <strong>Sandbox/Dev OTP:</strong> <code className="font-mono font-bold text-amber-950 text-xs">{devOtpHint}</code></span>
                                      <button
                                        type="button"
                                        onClick={() => setEnteredOtp(devOtpHint)}
                                        className="text-[10px] text-amber-700 font-bold underline hover:text-amber-900 cursor-pointer"
                                      >
                                        {isHi ? 'ऑटो-भरें' : 'Auto-fill'}
                                      </button>
                                    </div>
                                  )}

                                  {otpError && (
                                    <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                      <span>{otpError}</span>
                                    </p>
                                  )}
                                  {otpMessage && !otpError && (
                                    <p className="text-[11px] text-emerald-700 font-semibold">{otpMessage}</p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Row 2: Almora Block & Area / Ward */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    
                    {/* Almora Block Dropdown */}
                    <div className="space-y-1.5">
                      <Label htmlFor="complaint-block" className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isHi ? 'विकासखंड (Almora Block)' : 'Block (Almora District)'}</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <select
                        id="complaint-block"
                        value={form.block}
                        onChange={(e) => setForm((prev) => ({ ...prev, block: e.target.value }))}
                        className="flex h-11 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-navy-900 font-medium focus:bg-white focus:border-navy-900 focus:outline-none transition-colors cursor-pointer"
                        required
                      >
                        {ALMORA_BLOCKS.map((blk) => (
                          <option key={blk.value} value={blk.value}>
                            {isHi ? blk.nameHi : `${blk.nameEn} Block`}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Specific Location / Ward / Village */}
                    <div className="space-y-1.5">
                      <Label htmlFor="complaint-area" className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                        <span>{isHi ? 'ग्राम पंचायत / वार्ड / मोहल्ला / स्थान' : 'Gram Panchayat / Ward / Area'}</span>
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="complaint-area"
                        placeholder={isHi ? 'उदा. ग्राम धारानौला, मुख्य बाजार' : 'e.g. Village Dharanaula, Main Market'}
                        value={form.area}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => ({ ...prev, area: val }));
                          if (touched.area) validateField('area', val);
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, area: true }));
                          validateField('area', form.area);
                        }}
                        className={`h-11 text-sm rounded-xl transition-colors ${
                          touched.area && fieldErrors.area
                            ? 'border-red-400 bg-red-50/25 focus:border-red-500 focus:ring-red-100'
                            : touched.area && !fieldErrors.area && form.area.trim().length >= 2
                            ? 'border-emerald-500 bg-white'
                            : 'bg-slate-50/50 border-slate-300 focus:bg-white focus:border-navy-900'
                        }`}
                        required
                      />
                      {touched.area && fieldErrors.area && (
                        <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1 mt-1 animate-fade-in">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{fieldErrors.area}</span>
                        </p>
                      )}
                    </div>

                  </div>

                  {/* Row 3: Complaint Type */}
                  <div className="space-y-1.5">
                    <Label htmlFor="complaint-type" className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                      <MessageSquareWarning className="w-3.5 h-3.5 text-slate-500" />
                      <span>{isHi ? 'शिकायत का प्रकार / श्रेणी' : 'Complaint Category'}</span>
                      <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="complaint-type"
                      value={form.complaint_type}
                      onChange={(e) => setForm({ ...form, complaint_type: e.target.value })}
                      className="flex h-11 w-full rounded-xl border border-slate-300 bg-slate-50/50 px-3.5 py-2 text-sm text-navy-900 font-medium focus:bg-white focus:border-navy-900 focus:outline-none transition-colors cursor-pointer"
                      required
                    >
                      {complaintTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4: Description */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="complaint-desc" className="text-xs font-bold text-navy-900">
                        {isHi ? 'समस्या का विस्तृत विवरण' : 'Detailed Description of the Issue'}
                      </Label>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {form.description.length} / 1000
                      </span>
                    </div>
                    <Textarea
                      id="complaint-desc"
                      placeholder={isHi ? 'कृपया समस्या का संक्षिप्त विवरण लिखें (उदा. कचरा वाहन पिछले 2 दिनों से नहीं आया है)...' : 'Describe the cleanliness or vehicle issue in detail...'}
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value.slice(0, 1000) })}
                      className="text-sm bg-slate-50/50 border-slate-300 focus:bg-white focus:border-navy-900 rounded-xl resize-y min-h-[100px]"
                      rows={3}
                    />
                  </div>

                  {/* Row 5: File Upload (JPG, PNG, JPEG, PDF - Limit 1 file, 5 MB) */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <Label className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                        <span>{isHi ? 'फोटो / दस्तावेज संलग्न करें (साक्ष्य)' : 'Attach Photo / Document (Evidence)'}</span>
                        <span className="text-[11px] font-normal text-slate-400">({isHi ? 'वैकल्पिक' : 'Optional'})</span>
                      </Label>
                      <span className="text-[11px] text-slate-500 font-medium">
                        JPG, PNG, JPEG, PDF • {isHi ? 'अधिकतम 1 फ़ाइल (5 MB)' : 'Max 1 File (5 MB)'}
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="complaint-attachment"
                      accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {/* Selected File Card View */}
                    {attachedFile ? (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-300 flex items-center justify-between gap-3 animate-fade-in">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {filePreviewUrl ? (
                            <img
                              src={filePreviewUrl}
                              alt="Attachment preview"
                              className="w-12 h-12 object-cover rounded-xl border border-slate-200 shrink-0 shadow-2xs"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-2xs">
                              {attachedFile.type === 'application/pdf' ? (
                                <FileText className="w-6 h-6" />
                              ) : (
                                <ImageIcon className="w-6 h-6" />
                              )}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="text-xs sm:text-sm font-bold text-navy-950 truncate">
                              {attachedFile.name}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] text-slate-500 font-mono">
                                {(attachedFile.size / (1024 * 1024)).toFixed(2)} MB / 5 MB
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                <Check className="w-2.5 h-2.5" />
                                {isHi ? 'फ़ाइल मान्य' : 'Valid'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                          title={isHi ? 'फ़ाइल हटाएं' : 'Remove file'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Drag & Drop / Click to Upload Zone */
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-4 sm:p-5 text-center cursor-pointer transition-all ${
                          isDragging
                            ? 'border-navy-900 bg-amber-50/50 scale-[0.99]'
                            : 'border-slate-300 hover:border-navy-700 bg-slate-50/60 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-1.5">
                          <div className="w-10 h-10 rounded-full bg-navy-50 text-navy-900 flex items-center justify-center mb-0.5 shadow-2xs">
                            <Upload className="w-5 h-5 text-navy-900" />
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-navy-900">
                            {isHi ? 'फ़ाइल चुनें अथवा यहाँ ड्रैग करें' : 'Choose a file or drag & drop here'}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {isHi 
                              ? 'केवल 1 फ़ाइल (JPG, PNG, JPEG, PDF) — अधिकतम 5 MB' 
                              : 'Single file (JPG, PNG, JPEG, PDF) — Maximum size 5 MB'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* File Error Notification */}
                    {fileError && (
                      <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 mt-1 animate-fade-in">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{fileError}</span>
                      </p>
                    )}
                  </div>

                  {/* Row 6: Citizen Declaration Checkbox */}
                  <div className={`p-4 sm:p-4.5 rounded-2xl border transition-all ${
                    touched.declaration && fieldErrors.declaration
                      ? 'bg-red-50/70 border-red-400 ring-2 ring-red-400/20'
                      : declarationAccepted
                      ? 'bg-emerald-50/50 border-emerald-300'
                      : 'bg-slate-50/80 border-slate-200'
                  }`}>
                    <label className="flex items-start gap-3.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        id="citizen-declaration"
                        checked={declarationAccepted}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setDeclarationAccepted(val);
                          setTouched((prev) => ({ ...prev, declaration: true }));
                          validateField('declaration', val);
                        }}
                        className="mt-0.5 h-4.5 w-4.5 rounded border-slate-300 text-navy-900 focus:ring-navy-900 cursor-pointer accent-navy-900 shrink-0"
                        required
                      />
                      <div className="space-y-1 text-xs sm:text-sm">
                        <span className="font-bold text-navy-950 flex items-center gap-1.5">
                          <ShieldCheck className={`w-4 h-4 ${declarationAccepted ? 'text-emerald-600' : 'text-slate-400'}`} />
                          <span>{isHi ? 'नागरिक स्व-घोषणा (Citizen Self-Declaration)' : 'Citizen Self-Declaration'}</span>
                          <span className="text-red-500">*</span>
                        </span>
                        <p className="text-slate-600 text-xs leading-relaxed">
                          {isHi 
                            ? 'मैं प्रमाणित करता/करती हूँ कि मेरे द्वारा दी गई उपरोक्त सभी जानकारी पूर्णतः सत्य एवं सही है। किसी भी असत्य या भ्रामक विवरण के लिए मैं स्वयं जिम्मेदार रहूँगा/रहूँगी।'
                            : 'I hereby declare that all the information provided above is true and accurate to the best of my knowledge. I understand that submitting false or misleading complaints may lead to rejection.'}
                        </p>
                        {touched.declaration && fieldErrors.declaration && (
                          <p className="text-[11px] text-red-600 font-bold flex items-center gap-1 pt-1 animate-fade-in">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{fieldErrors.declaration}</span>
                          </p>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* Submit Action Button */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-navy-900 hover:bg-navy-800 text-white font-bold text-sm sm:text-base rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>{isHi ? 'शिकायत प्रेषित की जा रही है...' : 'Submitting Complaint...'}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 text-amber-400" />
                          <span>{isHi ? 'शिकायत ऑनलाइन प्रेषित करें' : 'Submit Grievance Now'}</span>
                        </>
                      )}
                    </Button>
                  </div>

                </form>
              </>
            ) : (
              /* Track Tab: Full Width Tracking Component */
              <div className="animate-fade-in">
                <ComplaintTrack initialId={trackQueryId} />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
});
