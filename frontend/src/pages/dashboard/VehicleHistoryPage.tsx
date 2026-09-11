import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vehicleService } from '@/services/vehicle.service';
import { historyService } from '@/services/history.service';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { History, MapPin, Clock, Route, Truck } from 'lucide-react';
import { format } from 'date-fns';
import type { Vehicle, HistoryResult } from '@/types';

const startIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#22C55E;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const endIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:24px;height:24px;border-radius:50%;background:#EF4444;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

export function VehicleHistoryPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [result, setResult] = useState<HistoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);

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
      setVehiclesLoading(false);
    }
  }

  async function handleViewHistory() {
    if (!selectedVehicle || !selectedDate) return;
    setLoading(true);
    setResult(null);

    try {
      const data = await historyService.getHistory(selectedVehicle, selectedDate);
      setResult(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  }

  const routeCoords = result?.history.map((h) => [h.latitude, h.longitude] as [number, number]) || [];
  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);

  return (
    <div className="animate-fade-in">
      {/* Official Government Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              <History className="w-3 h-3 text-emerald-600" />
              वाहन यात्रा इतिहास • Playback & Route Audit
            </span>
          </div>
          <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Vehicle Route History & Audit Log
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-medium">
            Analyze historical route playback, stoppage times, and daily distance covered by garbage trucks
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label>Select Vehicle</Label>
              {vehiclesLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm font-inter text-navy-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} {v.vehicle_name ? `(${v.vehicle_name})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Label>Select Date</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
            <Button
              onClick={handleViewHistory}
              disabled={!selectedVehicle || !selectedDate || loading}
              size="lg"
            >
              {loading ? 'Loading...' : 'View History'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-primary" />
                <p className="text-xs text-secondary-text">Vehicle</p>
              </div>
              <p className="font-semibold text-navy-900">{selectedVehicleData?.vehicle_number}</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-success" />
                <p className="text-xs text-secondary-text">Start - End</p>
              </div>
              <p className="font-semibold text-navy-900 text-sm">
                {result.summary.startTime
                  ? `${format(new Date(result.summary.startTime), 'HH:mm')} - ${format(new Date(result.summary.endTime!), 'HH:mm')}`
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Route className="w-4 h-4 text-accent" />
                <p className="text-xs text-secondary-text">Total Distance</p>
              </div>
              <p className="font-semibold text-navy-900">{result.summary.totalDistance} km</p>
            </div>
            <div className="bg-white rounded-xl border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="w-4 h-4 text-danger" />
                <p className="text-xs text-secondary-text">GPS Points</p>
              </div>
              <p className="font-semibold text-navy-900">{result.summary.totalPoints}</p>
            </div>
          </div>

          {/* Map */}
          {routeCoords.length === 0 ? (
            <EmptyState
              icon={History}
              title="No Vehicle History Available"
              description={`No GPS data found for ${selectedVehicleData?.vehicle_number} on ${selectedDate}. GPS history is only available when a real GPS device is transmitting data.`}
            />
          ) : (
            <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm h-[500px]">
              <MapContainer
                center={routeCoords[0]}
                zoom={14}
                className="h-full w-full"
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#2563EB', weight: 4, opacity: 0.8 }}
                />
                <Marker position={routeCoords[0]} icon={startIcon}>
                  <Popup>
                    <div className="font-inter text-sm">
                      <p className="font-semibold text-green-700">🟢 Start Point</p>
                      <p className="text-xs text-secondary-text">
                        {result.summary.startTime && format(new Date(result.summary.startTime), 'HH:mm:ss')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
                <Marker position={routeCoords[routeCoords.length - 1]} icon={endIcon}>
                  <Popup>
                    <div className="font-inter text-sm">
                      <p className="font-semibold text-red-700">🔴 End Point</p>
                      <p className="text-xs text-secondary-text">
                        {result.summary.endTime && format(new Date(result.summary.endTime), 'HH:mm:ss')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </>
      )}

      {/* Initial empty state */}
      {!result && !loading && (
        <EmptyState
          icon={History}
          title="Select a Vehicle and Date"
          description="Choose a vehicle and a date above, then click 'View History' to see the GPS route for that day."
        />
      )}
    </div>
  );
}
