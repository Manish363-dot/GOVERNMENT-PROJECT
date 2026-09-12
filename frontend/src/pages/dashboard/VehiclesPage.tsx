import { useState, useEffect } from 'react';
import { vehicleService } from '@/services/vehicle.service';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { format } from 'date-fns';
import type { Vehicle } from '@/types';
import { gpsDeviceService, GpsDevice } from '@/services/gpsDevice.service';
import { Radio } from 'lucide-react';

export function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [form, setForm] = useState({ vehicle_number: '', vehicle_name: '', vehicle_type: 'truck' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // GPS Linking State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkingVehicle, setLinkingVehicle] = useState<Vehicle | null>(null);
  const [availableDevices, setAvailableDevices] = useState<GpsDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [linking, setLinking] = useState(false);

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data.vehicles);
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setLoading(false);
    }
  }

  function openAddForm() {
    setEditingVehicle(null);
    setForm({ vehicle_number: '', vehicle_name: '', vehicle_type: 'truck' });
    setError('');
    setShowForm(true);
  }

  function openEditForm(vehicle: Vehicle) {
    setEditingVehicle(vehicle);
    setForm({
      vehicle_number: vehicle.vehicle_number,
      vehicle_name: vehicle.vehicle_name || '',
      vehicle_type: vehicle.vehicle_type,
    });
    setError('');
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editingVehicle) {
        await vehicleService.update(editingVehicle.id, form as any);
      } else {
        await vehicleService.create(form);
      }
      setShowForm(false);
      fetchVehicles();
    } catch (err: any) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await vehicleService.delete(id);
      fetchVehicles();
    } catch (err) {
      console.error('Failed to delete vehicle:', err);
    }
  }

  async function openLinkModal(vehicle: Vehicle) {
    setLinkingVehicle(vehicle);
    setSelectedDeviceId('');
    setShowLinkModal(true);
    try {
      const data = await gpsDeviceService.getAll();
      setAvailableDevices(data.devices);
    } catch (err) {
      console.error('Failed to fetch devices', err);
    }
  }

  async function handleLinkDevice() {
    if (!linkingVehicle || !selectedDeviceId) return;
    setLinking(true);
    try {
      await gpsDeviceService.assignToVehicle(linkingVehicle.id, selectedDeviceId);
      setShowLinkModal(false);
      alert('GPS Device linked successfully! Live tracking is now active for this vehicle.');
    } catch (err) {
      alert('Failed to link device');
    } finally {
      setLinking(false);
    }
  }

  const vehicleTypeLabels: Record<string, string> = {
    truck: 'Truck',
    mini_truck: 'Mini Truck',
    auto: 'Auto',
    other: 'Other',
  };

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wide">Sanitation Vehicles Directory</p>
              <p className="text-[10px] text-slate-400 font-mono">वाहन बेड़ा प्रबंधन | District Fleet Registry</p>
            </div>
          </div>
          <button
            onClick={openAddForm}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold uppercase tracking-wide px-3 py-1.5 rounded-sm transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add New Vehicle
          </button>
        </div>
        <div className="bg-[#f0f4f9] border-t border-slate-300 px-4 py-1.5">
          <p className="text-[10px] font-mono text-slate-600">
            Register, manage, and link GPS devices to municipal waste collection trucks
          </p>
        </div>
      </div>

      {/* ── Add/Edit Form ── */}
      {showForm && (
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
            <p className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">
              {editingVehicle ? 'Edit Vehicle Record' : 'Add New Vehicle Record'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {error && (
            <div className="mx-4 mt-3 p-2.5 bg-red-50 border border-red-200 rounded-sm">
              <p className="text-[11px] text-red-700 font-mono">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-4 grid sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Vehicle Number *</Label>
              <Input
                placeholder="e.g. UK-01-XX-1234"
                value={form.vehicle_number}
                onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                required
                className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Vehicle Name</Label>
              <Input
                placeholder="e.g. Ward 5 Truck"
                value={form.vehicle_name}
                onChange={(e) => setForm({ ...form, vehicle_name: e.target.value })}
                className="h-8 text-[11px] font-mono border-slate-300 rounded-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Vehicle Type</Label>
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                className="flex h-8 w-full border border-slate-300 bg-white px-2 text-[11px] font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
              >
                <option value="truck">Truck</option>
                <option value="mini_truck">Mini Truck</option>
                <option value="auto">Auto</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-2 pt-1 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors"
              >
                <Save className="w-3 h-3" />
                {saving ? 'Saving...' : editingVehicle ? 'Update Record' : 'Add Vehicle'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex items-center gap-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Link GPS Modal ── */}
      {showLinkModal && linkingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white border border-slate-300 rounded overflow-hidden w-full max-w-md shadow-2xl">
            <div className="bg-[#0a1628] px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="text-[11px] font-bold text-white uppercase tracking-wider">Link GPS Device</p>
                  <p className="text-[10px] text-slate-400 font-mono">{linkingVehicle.vehicle_number}</p>
                </div>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">Select GPS Device</Label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="flex h-8 w-full border border-slate-300 bg-white px-2 text-[11px] font-mono text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
                >
                  <option value="">-- Choose a registered device --</option>
                  {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>{d.device_identifier} ({d.device_type})</option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 font-mono">If device isn't listed, add it in the GPS Devices page first.</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={handleLinkDevice}
                  disabled={!selectedDeviceId || linking}
                  className="flex-1 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider py-2 rounded-sm transition-colors"
                >
                  {linking ? 'Linking...' : 'Link Device'}
                </button>
                <button
                  onClick={() => setShowLinkModal(false)}
                  className="border border-slate-300 text-slate-600 hover:bg-slate-50 text-[11px] font-bold uppercase px-4 py-2 rounded-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Vehicles Table ── */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : vehicles.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="No Vehicles Added"
          description="Start by adding garbage collection vehicles to the system. You can then assign GPS devices to track them."
        >
          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4" />
            Add First Vehicle
          </Button>
        </EmptyState>
      ) : (
        <div className="bg-white border border-slate-300 rounded overflow-hidden">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2">
            <p className="text-[10px] font-bold text-[#0a1628] uppercase tracking-widest font-mono">
              Vehicle Register — {vehicles.length} Record(s)
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-300 bg-[#f7f9fc]">
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Vehicle No.</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Name</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Type</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Status</th>
                  <th className="text-left px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Registered On</th>
                  <th className="text-right px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="hover:bg-[#f7f9fc] transition-colors">
                    <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-[#1a3a6b]">{vehicle.vehicle_number}</td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-700">{vehicle.vehicle_name || '—'}</td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-600 font-mono">{vehicleTypeLabels[vehicle.vehicle_type]}</td>
                    <td className="px-4 py-2.5">
                      <Badge variant={vehicle.status as any}>{vehicle.status}</Badge>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-slate-500 font-mono">
                      {format(new Date(vehicle.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openLinkModal(vehicle)}
                          className="flex items-center gap-1 text-[10px] font-bold font-mono text-[#1a3a6b] border border-[#1a3a6b]/30 bg-[#1a3a6b]/5 hover:bg-[#1a3a6b] hover:text-white px-2 py-1 rounded-sm transition-colors"
                        >
                          <Radio className="w-3 h-3" />
                          Link GPS
                        </button>
                        <button
                          onClick={() => openEditForm(vehicle)}
                          className="p-1.5 text-slate-500 hover:text-[#1a3a6b] hover:bg-[#f0f4f9] rounded-sm transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(vehicle.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-[#f0f4f9] border-t border-slate-300 px-4 py-1.5">
            <p className="text-[10px] font-mono text-slate-500">District Fleet Registry | Zila Panchayat Safai | Uttarakhand</p>
          </div>
        </div>
      )}
    </div>
  );
}
