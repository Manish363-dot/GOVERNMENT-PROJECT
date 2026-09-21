import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintService } from '@/services/complaint.service';
import { MessageSquareWarning, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ComplaintForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    area: '',
    complaint_type: 'vehicle_not_arrived',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const complaintTypes = [
    { value: 'vehicle_not_arrived', label: t('complaint.form.types.vehicle_not_arrived') },
    { value: 'garbage_not_collected', label: t('complaint.form.types.garbage_not_collected') },
    { value: 'other', label: t('complaint.form.types.other') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!form.name.trim() || !form.mobile.trim() || !form.area.trim()) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.mobile)) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      const result = await complaintService.create(form);
      setSuccess(result.complaint_number);
      setForm({ name: '', mobile: '', area: '', complaint_type: 'vehicle_not_arrived', description: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to submit complaint. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="complaint" className="py-10 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Left: Information */}
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-100 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-4 border border-amber-200">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              Public Grievance Redressal
            </div>

            <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
              {t('complaint.title')}
            </h2>
            <p className="text-slate-600 mb-8 leading-relaxed text-sm sm:text-base">
              {t('complaint.subtitle')}
            </p>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded bg-navy-900 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">Submit Grievance Form</p>
                  <p className="text-xs text-slate-500">Provide your contact details and description of the issue.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded bg-emerald-700 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">Receive Official Complaint Reference</p>
                  <p className="text-xs text-slate-500">A unique ZP reference number (e.g. ZP-2026-00001) will be generated.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-white rounded-lg border border-slate-200 shadow-xs">
                <div className="w-8 h-8 rounded bg-amber-600 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-navy-900 text-sm">Action by Administration</p>
                  <p className="text-xs text-slate-500">Zila Panchayat administration will inspect and resolve the issue.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form Card */}
          <Card className="shadow-md border border-slate-200 bg-white rounded-lg">
            <CardHeader className="bg-navy-900 text-white rounded-t-lg p-4 sm:p-5 border-b border-navy-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <MessageSquareWarning className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">{t('complaint.title')}</CardTitle>
                  <CardDescription className="text-xs text-slate-300">Uttarakhand Public Service Portal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {/* Success Alert */}
              {success && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-md flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-900 text-sm">{t('complaint.form.success')}</p>
                    <p className="text-emerald-800 text-xs mt-1">
                      {t('complaint.form.successMsg')} <span className="font-mono font-bold text-emerald-900">{success}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800 text-xs font-medium">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <Label htmlFor="mobile" className="text-xs font-semibold text-navy-900">{t('complaint.form.mobile')} *</Label>
                  <Input
                    id="mobile"
                    placeholder={t('complaint.form.mobilePlaceholder')}
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    className="border-slate-300 focus:border-navy-900 h-11 text-base sm:text-sm"
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

                <Button type="submit" className="w-full bg-navy-900 hover:bg-navy-800 text-white font-medium shadow-xs h-12 text-sm uppercase tracking-wide font-bold" size="lg" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t('complaint.form.submitting')}
                    </span>
                  ) : (
                    t('complaint.form.submit')
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
