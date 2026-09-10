import { useState, useEffect } from 'react';
import { gpsDeviceService, GpsDevice } from '@/services/gpsDevice.service';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Radio, Plus, Trash2, X, Smartphone, Cpu } from 'lucide-react';
import { format } from 'date-fns';

export function GpsDevicesPage() {
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
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-navy-900">GPS Devices</h1>
          <p className="text-sm text-secondary-text mt-1">Manage Traccar and hardware trackers</p>
        </div>
        <Button onClick={openAddForm}>
          <Plus className="w-4 h-4" />
          Add Device
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-poppins font-semibold text-navy-900">Add New GPS Device</h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-navy-400" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Device Identifier (Traccar ID) *</Label>
              <Input
                placeholder="e.g. 123456"
                value={form.device_identifier}
                onChange={(e) => setForm({ ...form, device_identifier: e.target.value })}
                required
              />
              <p className="text-xs text-secondary-text">Must match the identifier set in your Traccar app.</p>
            </div>
            <div className="space-y-2">
              <Label>Device Type</Label>
              <select
                value={form.device_type}
                onChange={(e) => setForm({ ...form, device_type: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-inter text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="mobile_app">Mobile App (Traccar Client)</option>
                <option value="hardwired">Hardwired GPS Device</option>
                <option value="obd2">OBD-II Tracker</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-2 mt-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Adding...' : 'Add Device'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Devices Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <EmptyState
          icon={Radio}
          title="No GPS Devices Added"
          description="Add a device identifier from Traccar so you can link it to a vehicle."
        >
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            Add First Device
          </Button>
        </EmptyState>
      ) : (
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Device</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Last Seen</th>
                  <th className="text-right px-4 py-3 font-semibold text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {devices.map((device) => (
                  <tr key={device.id} className="border-b border-border/50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-navy-900 font-mono">
                      {device.device_identifier}
                    </td>
                    <td className="px-4 py-3 text-secondary-text">
                      <div className="flex items-center gap-1.5">
                        {device.device_type === 'mobile_app' ? <Smartphone className="w-3.5 h-3.5" /> : <Cpu className="w-3.5 h-3.5" />}
                        {deviceTypeLabels[device.device_type]}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={device.status === 'active' ? 'success' : 'secondary'}>
                        {device.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary-text text-xs">
                      {device.last_seen_at ? format(new Date(device.last_seen_at), 'dd MMM yyyy HH:mm') : 'Never'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(device.id)}>
                        <Trash2 className="w-4 h-4 text-danger" />
                      </Button>
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
