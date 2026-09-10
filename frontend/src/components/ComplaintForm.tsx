import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { complaintService } from '@/services/complaint.service';
import { MessageSquareWarning, CheckCircle2, AlertCircle } from 'lucide-react';
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
    <section id="complaint" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: Info */}
          <div>
            <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              {t('complaint.title')}
            </h2>
            <p className="text-secondary-text mb-8 leading-relaxed">
              {t('complaint.subtitle')}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">1️</span>
                </div>
                <div>
                  <p className="font-medium text-navy-900 text-sm">Fill the form</p>
                  <p className="text-xs text-secondary-text">Provide your details and complaint information</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">2️</span>
                </div>
                <div>
                  <p className="font-medium text-navy-900 text-sm">Get your complaint ID</p>
                  <p className="text-xs text-secondary-text">A unique tracking number will be generated</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-white rounded-xl border border-border">
                <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">3️</span>
                </div>
                <div>
                  <p className="font-medium text-navy-900 text-sm">Admin resolves it</p>
                  <p className="text-xs text-secondary-text">Our team will take action and update the status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MessageSquareWarning className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{t('complaint.title')}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Success message */}
              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-800 text-sm">{t('complaint.form.success')}</p>
                    <p className="text-green-700 text-sm mt-1">
                      {t('complaint.form.successMsg')} <span className="font-mono font-bold">{success}</span>
                    </p>
                  </div>
                </div>
              )}

              {/* Error message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('complaint.form.name')} *</Label>
                  <Input
                    id="name"
                    placeholder={t('complaint.form.namePlaceholder')}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile">{t('complaint.form.mobile')} *</Label>
                  <Input
                    id="mobile"
                    placeholder={t('complaint.form.mobilePlaceholder')}
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    required
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">{t('complaint.form.area')} *</Label>
                  <Input
                    id="area"
                    placeholder={t('complaint.form.areaPlaceholder')}
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="complaint_type">{t('complaint.form.type')} *</Label>
                  <select
                    id="complaint_type"
                    value={form.complaint_type}
                    onChange={(e) => setForm({ ...form, complaint_type: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-inter text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-200"
                    required
                  >
                    {complaintTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t('complaint.form.description')}</Label>
                  <Textarea
                    id="description"
                    placeholder={t('complaint.form.descriptionPlaceholder')}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
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
