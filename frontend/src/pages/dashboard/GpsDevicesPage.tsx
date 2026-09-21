import { useState, useEffect } from 'react';
import { gpsDeviceService, GpsDevice } from '@/services/gpsDevice.service';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Plus, Trash2, X, Smartphone, Cpu, Save } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

export function GpsDevicesPage() {
  const { t } = useTranslation();
  const [devices, setDevices] = useState<GpsDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ device_identifier: '', device_type: 'mobile_app' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDevices();
  }, []);

  async function fetchDevices() {
    try {
      const data = await gpsDeviceService.getAll();
      setDevices(data.devices);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setForm({ device_identifier: '', device_type: 'mobile_app' });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await gpsDeviceService.create(form);
      setShowForm(false);
      fetchDevices();
    } catch (err: any) {
      setError(err.message || 'Failed to add device');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this device? Unlink it from vehicles first.')) return;
    try {
      await gpsDeviceService.delete(id);
      fetchDevices();
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  }

  const deviceTypeLabels: Record<string, string> = {
    mobile_app: 'Mobile App (Traccar Client)',
    hardwired: 'Hardwired GPS',
    obd2: 'OBD-II Tracker',
    other: 'Other',
  };

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[16px] font-bold text-white uppercase tracking-wide">{t('admin.gps.title')}</p>
            </div>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-sm transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('admin.gps.addBtn')}
          </button>
        </div>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">{t('admin.gps.form.addTitle')}</p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-[11px] text-red-700 font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                {t('admin.gps.form.identifier')}
              </Label>
              <Input
                placeholder="e.g. 123456"
                value={form.device_identifier}
                onChange={(e) => setForm({ ...form, device_identifier: e.target.value })}
                required
                className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
              <p className="text-[10px] text-slate-500 font-mono">Must match the identifier set in your Traccar app.</p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">{t('admin.gps.form.type')}</Label>
              <select
                value={form.device_type}
                onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                className="flex h-8 w-full border border-slate-300 bg-white px-2 text-[11px] font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
              >
                <option value="mobile_app">Mobile App (Traccar Client)</option>
                <option value="hardwired">Hardwired GPS Device</option>
                <option value="obd2">OBD-II Tracker</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2 pt-1 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors"
              >
                <Save className="w-3 h-3" />
                {saving ? t('admin.gps.form.btnSaving') : t('admin.gps.form.btnAdd')}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors"
              >
                {t('admin.gps.form.btnCancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Devices Table ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <EmptyState
          icon={Radio}
          title={t('admin.gps.emptyTitle')}
          description={t('admin.gps.emptyDesc')}
        >
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            {t('admin.gps.addFirst')}
          </Button>
        </EmptyState>
      ) : (
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2">
            <p className="text-[10px] font-bold text-[#0a1628] uppercase tracking-widest font-mono">
              {t('admin.gps.register')} — {devices.length} Device(s)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-[#f7f9fc]">
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">{t('admin.gps.table.identifier')}</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">{t('admin.gps.table.type')}</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">{t('admin.gps.table.status')}</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Last Seen</th>
                  <th className="text-right px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">{t('admin.gps.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-[#f7f9fc] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-[#1a3a6b]">
                      {device.device_identifier}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-600 font-mono">
                      <div className="flex items-center gap-1.5">
                        {device.device_type === 'mobile_app' ? <Smartphone className="w-3 h-3" /> : <Cpu className="w-3 h-3" />}
                        {deviceTypeLabels[device.device_type]}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <Badge variant={device.status === 'active' ? 'success' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">
                      {device.last_seen_at ? format(new Date(device.last_seen_at), 'dd MMM yyyy HH:mm') : 'Never'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
