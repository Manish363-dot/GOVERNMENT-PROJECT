import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ContactSection() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('contact.form.success'));
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-200 text-navy-900 text-xs font-semibold uppercase tracking-wider mb-3 border border-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-navy-700" />
            {t('contact.badge')}
          </div>
          <h2 className="font-poppins text-2xl sm:text-3xl font-bold text-navy-900 mb-3">
            {t('contact.title')}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-3.5">
            <Card className="border-slate-200 bg-white shadow-xs rounded-lg">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded bg-navy-900 text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">{t('contact.tollFreeLabel')}</p>
                  <p className="font-bold text-navy-900 text-sm">1800-185-1850</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs rounded-lg">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded bg-emerald-800 text-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">{t('contact.emailLabel')}</p>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">safai@zilapanchayat.uk.gov.in</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white shadow-xs rounded-lg">
              <CardContent className="p-4 flex items-center gap-3.5">
                <div className="w-10 h-10 rounded bg-amber-600 text-white flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-medium uppercase">{t('contact.hqLabel')}</p>
                  <p className="font-semibold text-navy-900 text-xs sm:text-sm">{t('contact.hqAddress')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 border-slate-200 bg-white shadow-xs rounded-lg">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-name" className="text-xs font-semibold text-navy-900">{t('contact.form.nameLabel')}</Label>
                    <Input
                      id="contact-name"
                      placeholder={t('contact.form.namePlaceholder')}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="border-slate-300 focus:border-navy-900 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="contact-email" className="text-xs font-semibold text-navy-900">{t('contact.form.emailLabel')}</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder={t('contact.form.emailPlaceholder')}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="border-slate-300 focus:border-navy-900 text-sm"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contact-message" className="text-xs font-semibold text-navy-900">{t('contact.form.messageLabel')}</Label>
                  <Textarea
                    id="contact-message"
                    placeholder={t('contact.form.messagePlaceholder')}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="border-slate-300 focus:border-navy-900 text-sm"
                    rows={4}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="bg-navy-900 hover:bg-navy-800 text-white font-medium shadow-xs">
                  <Send className="w-4 h-4 mr-2" />
                  {t('contact.form.submit')}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
