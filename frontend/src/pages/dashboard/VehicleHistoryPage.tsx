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
import { Skeleton } from '@/components/ui/skeleton';
import { History, MapPin, Clock, Route, Truck, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { Vehicle, HistoryResult } from '@/types';

const startIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#16a34a;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const endIcon = L.divIcon({
  className: 'custom-marker',
  html: '<div style="width:20px;height:20px;border-radius:50%;background:#dc2626;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

export function VehicleHistoryPage() {
  const { t } = useTranslation();
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
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#0a1628] px-4 py-2.5 flex items-center gap-2">
          <History className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <p className="text-[16px] font-bold text-white uppercase tracking-wide">
              {t('admin.history.title')}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2">
          <p className="text-[14px] font-bold text-[#0a1628] uppercase tracking-widest font-bold">{t('admin.history.filter.title')}</p>
        </div>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-bold text-slate-700 uppercase tracking-wider font-bold">{t('admin.history.filter.selectVehicle')}</Label>
              {vehiclesLoading ? (
                <Skeleton className="h-8 w-full rounded-sm" />
              ) : (
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="flex h-8 w-full border border-slate-300 bg-white px-2 text-[11px] font-bold text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
                >
                  <option value="">{t('admin.history.filter.chooseVehicle')}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} {v.vehicle_name ? `(${v.vehicle_name})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[14px] font-bold text-slate-700 uppercase tracking-wider font-bold">{t('admin.history.filter.date')}</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-8 text-[11px] font-bold border-slate-300 rounded-sm"
              />
            </div>
            <button
              onClick={handleViewHistory}
              disabled={!selectedVehicle || !selectedDate || loading}
              className="flex items-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-2 rounded-sm transition-colors whitespace-nowrap"
            >
              <Search className="w-3.5 h-3.5" />
              {loading ? t('admin.history.filter.btnLoading') : t('admin.history.filter.btnQuery')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Truck, label: 'Vehicle', value: selectedVehicleData?.vehicle_number || '—' },
              {
                icon: Clock, label: 'Start — End', value: result.summary.startTime
                  ? `${format(new Date(result.summary.startTime), 'HH:mm')} – ${format(new Date(result.summary.endTime!), 'HH:mm')}`
                  : 'N/A'
              },
              { icon: Route, label: 'Total Distance', value: `${result.summary.totalDistance} km` },
              { icon: MapPin, label: 'GPS Points', value: String(result.summary.totalPoints) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white border border-slate-300 rounded overflow-hidden">
                <div className="bg-[#f0f4f9] border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-[#1a3a6b]" />
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest font-mono">{label}</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="font-mono text-sm font-bold text-[#0a1628]">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          {routeCoords.length === 0 ? (
            <EmptyState
              icon={History}
              title={t('admin.history.playback.noData')}
              description=""
            />
          ) : (
            <div className="bg-white border border-slate-300 rounded overflow-hidden">
              <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
                <p className="text-[11px] font-bold text-[#0a1628] uppercase tracking-wider font-mono">
                  {t('admin.history.filter.title')} — {selectedVehicleData?.vehicle_number}
                </p>
                <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />Start</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600 inline-block" />End</span>
                </div>
              </div>
              <div className="h-[480px]">
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
                    pathOptions={{ color: '#1a3a6b', weight: 3, opacity: 0.8 }}
                  />
                  <Marker position={routeCoords[0]} icon={startIcon}>
                    <Popup>
                      <div className="font-mono text-xs">
                        <p className="font-bold text-emerald-700">Start Point</p>
                        <p className="text-slate-500">{result.summary.startTime && format(new Date(result.summary.startTime), 'HH:mm:ss')}</p>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={routeCoords[routeCoords.length - 1]} icon={endIcon}>
                    <Popup>
                      <div className="font-mono text-xs">
                        <p className="font-bold text-red-700">End Point</p>
                        <p className="text-slate-500">{result.summary.endTime && format(new Date(result.summary.endTime), 'HH:mm:ss')}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
              <div className="bg-[#f0f4f9] border-t border-slate-300 px-4 py-1.5">
                <p className="text-[10px] font-mono text-slate-500">Route Audit Log | Zila Panchayat Safai | Uttarakhand</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial empty state */}
      {!result && !loading && (
        <div className="bg-white border border-slate-300 rounded p-10 text-center">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest font-mono">{t('admin.history.filter.chooseVehicle')} &amp; {t('admin.history.filter.date')}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-1"></p>
        </div>
      )}
    </div>
  );
}
