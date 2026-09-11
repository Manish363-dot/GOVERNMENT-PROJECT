import { useState, useEffect } from 'react';
import { vehicleService } from '@/services/vehicle.service';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Truck, Plus, Pencil, Trash2, X } from 'lucide-react';
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
      // Fetch all devices (in a real app you might only fetch unassigned ones)
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
    <div className="animate-fade-in">
      {/* Official Government Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              <Truck className="w-3 h-3 text-emerald-600" />
              वाहन बेड़ा प्रबंधन • District Fleet Registry
            </span>
          </div>
          <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Sanitation Vehicles Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Register, manage, and link GPS devices to municipal waste collection trucks
          </p>
        </div>
        <Button onClick={openAddForm} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-sm">
          <Plus className="w-4 h-4 mr-1" />
          Add New Vehicle
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border p-6 mb-6 animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-poppins font-semibold text-navy-900">
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <button onClick={() => setShowForm(false)}>
              <X className="w-4 h-4 text-navy-400" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Number *</Label>
              <Input
                placeholder="e.g. MP-09-XX-1234"
                value={form.vehicle_number}
                onChange={(e) => setForm({ ...form, vehicle_number: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Name</Label>
              <Input
                placeholder="e.g. Ward 5 Truck"
                value={form.vehicle_name}
                onChange={(e) => setForm({ ...form, vehicle_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <select
                value={form.vehicle_type}
                onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-inter text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
              >
                <option value="truck">Truck</option>
                <option value="mini_truck">Mini Truck</option>
                <option value="auto">Auto</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="sm:col-span-3 flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingVehicle ? 'Update Vehicle' : 'Add Vehicle'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Link GPS Modal */}
      {showLinkModal && linkingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-xl shadow-xl border border-border w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Radio className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-poppins font-semibold text-navy-900">Link GPS Device</h3>
                  <p className="text-xs text-secondary-text">{linkingVehicle.vehicle_number}</p>
                </div>
              </div>
              <button onClick={() => setShowLinkModal(false)} className="text-navy-400 hover:bg-navy-50 p-2 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select GPS Device</Label>
                <select
                  value={selectedDeviceId}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-inter text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  <option value="">-- Choose a registered device --</option>
                  {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>{d.device_identifier} ({d.device_type})</option>
                  ))}
                </select>
                <p className="text-xs text-secondary-text mt-1">If the device isn't listed, add it in the GPS Devices page first.</p>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowLinkModal(false)}>Cancel</Button>
                <Button onClick={handleLinkDevice} disabled={!selectedDeviceId || linking}>
                  {linking ? 'Linking...' : 'Link Device'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vehicles Table */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
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
        <div className="bg-white rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-navy-50 border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Vehicle Number</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Status</th>
                  <th className="text-left px-4 py-3 font-semibold text-navy-700">Created</th>
                  <th className="text-right px-4 py-3 font-semibold text-navy-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} className="border-b border-border/50 hover:bg-navy-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-navy-900">{vehicle.vehicle_number}</td>
                    <td className="px-4 py-3 text-secondary-text">{vehicle.vehicle_name || '—'}</td>
                    <td className="px-4 py-3 text-secondary-text">{vehicleTypeLabels[vehicle.vehicle_type]}</td>
                    <td className="px-4 py-3">
                      <Badge variant={vehicle.status as any}>{vehicle.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-secondary-text text-xs">
                      {format(new Date(vehicle.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openLinkModal(vehicle)} className="text-primary hover:text-primary hover:bg-primary/10 mr-2 border border-primary/20 bg-primary/5">
                          <Radio className="w-3.5 h-3.5 mr-2" />
                          Link GPS
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEditForm(vehicle)}>
                          <Pencil className="w-4 h-4 text-navy-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="w-4 h-4 text-danger" />
                        </Button>
                      </div>
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
