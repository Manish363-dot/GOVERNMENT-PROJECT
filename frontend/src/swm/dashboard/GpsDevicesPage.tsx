import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { gpsDeviceService, GpsDevice } from '@/services/gpsDevice.service';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Plus, Trash2, X, Smartphone, Cpu, Save, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

export const GpsDevicesPage = React.memo(() => {
  const { t, i18n } = useTranslation();
  const [devices, setDevices] = useState<GpsDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    device_name: '',
    device_identifier: '',
    imei: '',
    sim_number: '',
    device_type: 'hardwired',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  function toggleExpand(id: string) {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  }

  const isHi = i18n.language === 'hi';

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
    setEditingId(null);
    setForm({
      device_name: '',
      device_identifier: '',
      imei: '',
      sim_number: '',
      device_type: 'hardwired',
    });
    setError('');
    setShowForm(true);
  }

  function openEditForm(device: GpsDevice) {
    setEditingId(device.id);
    setForm({
      device_name: device.device_name || '',
      device_identifier: device.device_identifier || '',
      imei: device.imei || '',
      sim_number: device.sim_number || '',
      device_type: device.device_type || 'hardwired',
    });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        device_identifier: form.device_identifier.trim() || form.imei.trim(),
        imei: form.imei.trim() || form.device_identifier.trim(),
      };
      if (editingId) {
        await gpsDeviceService.update(editingId, payload);
      } else {
        await gpsDeviceService.create(payload);
      }
      setShowForm(false);
      setEditingId(null);
      fetchDevices();
    } catch (err: any) {
      setError(err.message || 'Failed to save device');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(isHi ? 'क्या आप इस उपकरण को हटाना चाहते हैं?' : 'Are you sure you want to delete this device? Unlink it from vehicles first.')) return;
    try {
      await gpsDeviceService.delete(id);
      fetchDevices();
    } catch (err) {
      console.error('Failed to delete device:', err);
    }
  }

  const deviceTypeLabels: Record<string, string> = {
    hardwired: isHi ? 'हार्डवायर्ड जीपीएस उपकरण' : 'Hardwired GPS',
    mobile_app: isHi ? 'मोबाइल ऐप (मिलीट्रैक / जीपीएस क्लाइंट)' : 'Mobile App (MilliTrack / GPS Client)',
    obd2: isHi ? 'ओबीडी-II ट्रैकर' : 'OBD-II Tracker',
    other: isHi ? 'अन्य' : 'Other',
  };

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[16px] font-bold text-white uppercase tracking-normal">
                {t('admin.devices.title')}
              </p>
            </div>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-sm transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            {t('admin.devices.registerDevice')}
          </button>
        </div>
      </div>

      {/* ── Add Form ── */}
      {showForm && (
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
            <p className="text-[12px] font-bold text-[#0a1628] uppercase tracking-normal">
              {editingId ? (isHi ? 'उपकरण विवरण संपादित करें' : 'Edit GPS Device') : t('admin.devices.registerDevice')}
            </p>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-[11px] text-red-700 font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                {isHi ? 'उपकरण का नाम' : 'Device Name'}
              </Label>
              <Input
                placeholder="e.g. TRUCK2 GPS"
                value={form.device_name}
                onChange={(e) => setForm({ ...form, device_name: e.target.value })}
                className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                {isHi ? 'आईएमईआई नंबर (IMEI)' : 'IMEI Number'} *
              </Label>
              <Input
                placeholder="e.g. 869925074843044"
                value={form.imei}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    imei: val,
                    device_identifier: form.device_identifier === '' || form.device_identifier === form.imei ? val : form.device_identifier,
                  });
                }}
                required
                className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                {isHi ? 'सिम कार्ड नंबर (SIM No.)' : 'SIM Card Number'}
              </Label>
              <Input
                placeholder="e.g. 5754218528440"
                value={form.sim_number}
                onChange={(e) => setForm({ ...form, sim_number: e.target.value })}
                className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                {t('admin.devices.deviceIdentifier')} (MilliTrack / IMEI ID) *
              </Label>
              <Input
                placeholder="e.g. 869925074843044"
                value={form.device_identifier}
                onChange={(e) => setForm({ ...form, device_identifier: e.target.value })}
                required
                className="h-f8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
                {isHi ? 'उपकरण प्रकार' : 'Device Type'}
              </Label>
              <select
                value={form.device_type}
                onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                className="flex h-8 w-full border border-slate-300 bg-white px-2 text-[11px] font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
              >
                <option value="hardwired">{deviceTypeLabels.hardwired}</option>
                <option value="mobile_app">{deviceTypeLabels.mobile_app}</option>
                <option value="obd2">{deviceTypeLabels.obd2}</option>
                <option value="other">{deviceTypeLabels.other}</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2 pt-1 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors"
              >
                <Save className="w-3 h-3" />
                {saving
                  ? (isHi ? 'सहेज रहे हैं...' : 'Saving...')
                  : editingId
                  ? (isHi ? 'अपडेट सहेजें' : 'Save Changes')
                  : (isHi ? 'उपकरण जोड़ें' : 'Register Device')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
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
          title={isHi ? 'कोई जीपीएस उपकरण नहीं मिला' : 'No GPS Devices Added'}
          description={isHi ? 'वाहन से जोड़ने के लिए ट्रैकर उपकरण पंजीकृत करें।' : 'Add a device identifier from MilliTrack so you can link it to a vehicle.'}
        >
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            {t('admin.devices.registerDevice')}
          </Button>
        </EmptyState>
      ) : (
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2">
            <p className="text-[12px] font-bold text-[#0a1628] uppercase tracking-normal">
              {t('admin.devices.title')} — {devices.length} {isHi ? 'उपकरण' : 'Device(s)'}
            </p>
          </div>
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-[#f7f9fc]">
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {t('admin.devices.deviceIdentifier')}
                  </th>
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    IMEI
                  </th>
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {isHi ? 'सिम नंबर' : 'SIM No.'}
                  </th>
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {isHi ? 'आवंटित वाहन' : 'Assigned Vehicle'}
                  </th>
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {isHi ? 'प्रकार' : 'Type'}
                  </th>
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {t('admin.devices.status')}
                  </th>
                  <th className="text-left px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {isHi ? 'अंतिम देखा गया' : 'Last Seen'}
                  </th>
                  <th className="text-right px-4 py-2 text-[12px] font-bold text-slate-600 uppercase tracking-normal">
                    {t('admin.devices.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {devices.map((device) => (
                  <tr key={device.id} className="hover:bg-[#f7f9fc] transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="font-mono text-[11px] font-bold text-[#1a3a6b]">
                        {device.device_identifier}
                      </div>
                      {device.device_name && (
                        <div className="text-[10px] text-slate-500 font-sans font-medium">
                          {device.device_name}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-slate-700">
                      {device.imei || device.device_identifier}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-emerald-700 font-semibold">
                      {device.sim_number || (
                        <span className="text-slate-400 font-sans italic text-[10px]">
                          {isHi ? 'दर्ज नहीं' : 'Not set'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {device.assigned_vehicle ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                          {device.assigned_vehicle.vehicle_number}
                          {device.assigned_vehicle.vehicle_name ? ` (${device.assigned_vehicle.vehicle_name})` : ''}
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-semibold italic">
                          {isHi ? 'अनआवंटित' : 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-600">
                      <div className="flex items-center gap-1.5">
                        {device.device_type === 'mobile_app' ? <Smartphone className="w-3 h-3 text-slate-400" /> : <Cpu className="w-3 h-3 text-slate-400" />}
                        <span>{deviceTypeLabels[device.device_type || 'hardwired'] || device.device_type}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${device.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                        <Badge variant={device.status === 'active' ? 'success' : 'secondary'} className="text-[10px] tracking-wide font-bold">
                          {device.status === 'active'
                            ? (isHi ? 'सक्रिय' : 'Active')
                            : (isHi ? 'निष्क्रिय' : 'Inactive')}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">
                      {device.last_seen_at ? format(new Date(device.last_seen_at), 'dd MMM yyyy HH:mm') : (isHi ? 'कभी नहीं' : 'Never')}
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-1">
                      <button
                        onClick={() => openEditForm(device)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-sm transition-colors"
                        title={isHi ? 'संपादित करें' : 'Edit'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(device.id)}
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                        title={isHi ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View with View More Expandable Section */}
          <div className="md:hidden flex flex-col divide-y divide-slate-200">
            {devices.map((device) => {
              const isExpanded = Boolean(expandedIds[device.id]);
              return (
                <div key={device.id} className="p-3.5 space-y-2.5 bg-white transition-all">
                  {/* Compact Header: Name/Identifier + Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                        <p className="font-bold text-sm text-[#0a1628] truncate">
                          {device.device_name || device.device_identifier}
                        </p>
                      </div>
                      <p className="font-mono text-[11px] text-slate-500 font-medium pl-5 truncate">
                        ID: {device.device_identifier}
                      </p>
                    </div>
                    <Badge variant={device.status === 'active' ? 'success' : 'secondary'} className="shrink-0 text-[10px] font-bold">
                      {device.status === 'active'
                        ? (isHi ? '🟢 सक्रिय' : 'Active')
                        : (isHi ? '⚪ निष्क्रिय' : 'Inactive')}
                    </Badge>
                  </div>

                  {/* Compact Row: Assigned Vehicle + View More Button */}
                  <div className="flex items-center justify-between gap-2 text-xs pt-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">
                        {isHi ? 'वाहन:' : 'Vehicle:'}
                      </span>
                      {device.assigned_vehicle ? (
                        <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px] border border-blue-200 truncate">
                          {device.assigned_vehicle.vehicle_number}
                          {device.assigned_vehicle.vehicle_name ? ` (${device.assigned_vehicle.vehicle_name})` : ''}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-semibold italic text-[11px]">
                          {isHi ? 'अनआवंटित' : 'Unassigned'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(device.id)}
                      className="flex items-center gap-1 text-[11px] font-bold text-[#1a3a6b] hover:text-blue-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 py-1 rounded-sm transition-colors shrink-0"
                    >
                      <span>
                        {isExpanded
                          ? (isHi ? 'कम देखें' : 'View Less')
                          : (isHi ? 'और देखें' : 'View More')}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Expandable Details Section */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-100 space-y-2.5 animate-fade-in">
                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            IMEI:
                          </span>
                          <span className="font-mono font-semibold text-slate-800 text-[11px] break-all">
                            {device.imei || device.device_identifier}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            {isHi ? 'सिम नंबर:' : 'SIM Number:'}
                          </span>
                          <span className="font-mono font-semibold text-emerald-700 text-[11px]">
                            {device.sim_number || (isHi ? 'दर्ज नहीं' : 'Not set')}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            {isHi ? 'प्रकार:' : 'Type:'}
                          </span>
                          <div className="flex items-center gap-1 text-slate-700 text-[11px] font-medium pt-0.5">
                            {device.device_type === 'mobile_app' ? (
                              <Smartphone className="w-3 h-3 text-slate-400" />
                            ) : (
                              <Cpu className="w-3 h-3 text-slate-400" />
                            )}
                            <span className="truncate">
                              {deviceTypeLabels[device.device_type || 'hardwired'] || device.device_type}
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">
                            {isHi ? 'अंतिम देखा गया:' : 'Last Seen:'}
                          </span>
                          <span className="text-[11px] text-slate-600 font-mono">
                            {device.last_seen_at
                              ? format(new Date(device.last_seen_at), 'dd MMM HH:mm')
                              : (isHi ? 'कभी नहीं' : 'Never')}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons inside expanded area */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => openEditForm(device)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-[11px] font-bold uppercase tracking-normal transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          {isHi ? 'संपादित करें' : 'Edit'}
                        </button>
                        <button
                          onClick={() => handleDelete(device.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded text-[11px] font-bold uppercase tracking-normal transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          {isHi ? 'हटाएं' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});
