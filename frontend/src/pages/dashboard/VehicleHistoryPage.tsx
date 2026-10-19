import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { vehicleService } from '@/services/vehicle.service';
import { historyService } from '@/services/history.service';
import { EmptyState } from '@/components/EmptyState';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { History, MapPin, Clock, Route, Truck, Search, Maximize2, Minimize2 } from 'lucide-react';
import { format } from 'date-fns';
import type { Vehicle, HistoryResult } from '@/types';
import { cn } from '@/lib/utils';

// Helper component inside MapContainer to handle bounding boxes and resize when opening Big Screen
function MapController({
  routeCoords,
  isFullscreen,
}: {
  routeCoords: [number, number][];
  isFullscreen: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 0) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [routeCoords, map]);

  useEffect(() => {
    // Leaflet requires invalidateSize whenever container dimensions change
    const t1 = setTimeout(() => {
      map.invalidateSize();
      if (routeCoords.length > 0) {
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50], maxZoom: 16 });
      }
    }, 150);
    const t2 = setTimeout(() => {
      map.invalidateSize();
    }, 400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isFullscreen, map, routeCoords]);

  return null;
}

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

export const VehicleHistoryPage = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [result, setResult] = useState<HistoryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (mapContainerRef.current && !document.fullscreenElement) {
          if (mapContainerRef.current.requestFullscreen) {
            mapContainerRef.current.requestFullscreen().catch(() => {});
          }
        }
      } catch (e) {
        // Fallback to CSS fullscreen
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement && document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        toggleFullscreen();
      }
    };
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      if (!isFull && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

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
            <p className="text-[16px] font-bold text-white uppercase tracking-normal">
              {isHi ? 'वाहन रूट इतिहास एवं ऑडिट लॉग' : 'Vehicle Route History & Audit Log'}
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Panel ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden">
        <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2">
          <p className="text-[14px] font-bold text-[#0a1628] uppercase tracking-normal">
            {isHi ? 'रूट इतिहास खोजें' : 'Search Route History'}
          </p>
        </div>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label className="text-[12px] sm:text-[14px] font-bold text-slate-700 uppercase tracking-normal">
                {isHi ? 'वाहन चुनें' : 'Select Vehicle'}
              </Label>
              {vehiclesLoading ? (
                <Skeleton className="h-10 sm:h-8 w-full rounded-sm" />
              ) : (
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="flex h-10 sm:h-8 w-full border border-slate-300 bg-white px-2.5 text-xs sm:text-[11px] font-bold text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded-sm"
                >
                  <option value="">{isHi ? '-- वाहन चुनें --' : '-- Select Vehicle --'}</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} {v.vehicle_name ? `(${v.vehicle_name})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <Label className="text-[12px] sm:text-[14px] font-bold text-slate-700 uppercase tracking-normal">
                {isHi ? 'दिनांक चुनें' : 'Select Date'}
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-10 sm:h-8 text-xs sm:text-[11px] font-bold border-slate-300 rounded-sm"
              />
            </div>
            <button
              onClick={handleViewHistory}
              disabled={!selectedVehicle || !selectedDate || loading}
              className="flex items-center justify-center gap-1.5 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-xs sm:text-[11px] font-bold uppercase tracking-normal px-5 h-10 sm:h-8 rounded-sm transition-colors whitespace-nowrap w-full sm:w-auto"
            >
              <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              {loading ? (isHi ? 'लोड हो रहा है...' : 'Loading...') : (isHi ? 'इतिहास देखें' : 'View History')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Truck, label: isHi ? 'वाहन' : 'Vehicle', value: selectedVehicleData?.vehicle_number || '—' },
              {
                icon: Clock, label: isHi ? 'प्रारंभ — समाप्त' : 'Start — End', value: result.summary.startTime
                  ? `${format(new Date(result.summary.startTime), 'HH:mm')} – ${format(new Date(result.summary.endTime!), 'HH:mm')}`
                  : 'N/A'
              },
              { icon: Route, label: isHi ? 'कुल दूरी' : 'Total Distance', value: `${result.summary.totalDistance} ${isHi ? 'किमी' : 'km'}` },
              { icon: MapPin, label: isHi ? 'जीपीएस बिंदु' : 'GPS Points', value: String(result.summary.totalPoints) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white border border-slate-300 rounded overflow-hidden">
                <div className="bg-[#f0f4f9] border-b border-slate-200 px-3 py-1.5 flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-[#1a3a6b]" />
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-normal">{label}</p>
                </div>
                <div className="px-3 py-2.5">
                  <p className="font-mono text-xs sm:text-sm font-bold text-[#0a1628] truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Map */}
          {routeCoords.length === 0 ? (
            <EmptyState
              icon={History}
              title={isHi ? 'कोई वाहन इतिहास उपलब्ध नहीं' : 'No Vehicle History Available'}
              description={
                isHi
                  ? `${selectedVehicleData?.vehicle_number || 'वाहन'} के लिए ${selectedDate} पर कोई जीपीएस डेटा नहीं मिला। जीपीएस इतिहास केवल तभी उपलब्ध होता है जब एक वास्तविक जीपीएस उपकरण डेटा प्रसारित कर रहा हो।`
                  : `No GPS data found for ${selectedVehicleData?.vehicle_number} on ${selectedDate}. GPS history is only available when a real GPS device is transmitting data.`
              }
            />
          ) : (
            <div
              ref={mapContainerRef}
              className={cn(
                "bg-white border border-slate-300 rounded overflow-hidden transition-all duration-200",
                isFullscreen
                  ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none flex flex-col bg-slate-900 shadow-2xl"
                  : "shadow-xs"
              )}
            >
              {/* Header Strip */}
              <div
                className={cn(
                  "px-4 py-2 flex items-center justify-between border-b transition-colors",
                  isFullscreen
                    ? "bg-[#0a1628] border-slate-700 text-white shrink-0"
                    : "bg-[#f0f4f9] border-slate-300"
                )}
              >
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "text-[12px] sm:text-[13px] font-bold uppercase tracking-normal",
                      isFullscreen ? "text-white flex items-center gap-2" : "text-[#0a1628]"
                    )}
                  >
                    {isHi ? 'रूट मानचित्र' : 'Route Map'} —{" "}
                    <span className={isFullscreen ? "text-amber-400 font-mono" : ""}>
                      {selectedVehicleData?.vehicle_number}
                    </span>
                    {isFullscreen && (
                      <span className="hidden sm:inline-block text-[11px] font-normal text-slate-300 font-mono">
                        ({selectedDate} • {result.summary.totalDistance} {isHi ? 'किमी' : 'km'})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 text-[10px] font-mono",
                      isFullscreen
                        ? "text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700"
                        : "text-slate-500"
                    )}
                  >
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      {isHi ? 'प्रारंभ' : 'Start'}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                      {isHi ? 'समाप्त' : 'End'}
                    </span>
                    <span className="hidden sm:flex items-center gap-1">
                      <span className="w-3.5 h-1 bg-[#1a3a6b] rounded inline-block" />
                      {isHi ? 'रूट पथ' : 'Route'}
                    </span>
                  </div>

                  {/* Big Screen Toggle Button */}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded transition-colors shadow-xs cursor-pointer",
                      isFullscreen
                        ? "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                        : "bg-[#0a1628] hover:bg-[#1a3a6b] text-white"
                    )}
                    title={
                      isFullscreen
                        ? isHi
                          ? 'सामान्य स्क्रीन पर लौटें (ESC)'
                          : 'Exit Big Screen (ESC)'
                        : isHi
                        ? 'मानचित्र को बड़ी स्क्रीन में खोलें'
                        : 'Open map in big screen'
                    }
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-3.5 h-3.5" />
                        <span>{isHi ? 'स्क्रीन छोटी करें (ESC)' : 'Exit Big Screen (ESC)'}</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>{isHi ? 'बड़ी स्क्रीन' : 'Big Screen'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Map Area */}
              <div
                className={cn(
                  "relative w-full",
                  isFullscreen ? "flex-1 h-full" : "h-[360px] sm:h-[480px] lg:h-[540px]"
                )}
              >
                {/* Floating Quick Action Button on Map */}
                <div className="absolute top-3 right-3 z-[1000]">
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="h-8 sm:h-9 px-2.5 sm:px-3 bg-white hover:bg-slate-50 text-slate-800 rounded border border-slate-300 shadow-md font-bold text-xs flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
                    title={
                      isFullscreen
                        ? isHi
                          ? 'सामान्य स्क्रीन (ESC)'
                          : 'Exit Big Screen (ESC)'
                        : isHi
                        ? 'बड़ी स्क्रीन में देखें'
                        : 'View in Big Screen'
                    }
                  >
                    {isFullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4 text-amber-600" />
                        <span className="hidden sm:inline font-mono text-[11px]">
                          {isHi ? 'स्क्रीन छोटी करें' : 'Exit Big Screen'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 text-[#1a3a6b]" />
                        <span className="font-mono text-[11px]">
                          {isHi ? 'बड़ी स्क्रीन' : 'Big Screen'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                <MapContainer
                  center={routeCoords[0]}
                  zoom={14}
                  className="h-full w-full"
                  scrollWheelZoom={true}
                  attributionControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                  />
                  <MapController routeCoords={routeCoords} isFullscreen={isFullscreen} />
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: '#1a3a6b', weight: 4, opacity: 0.85 }}
                  />
                  <Marker position={routeCoords[0]} icon={startIcon}>
                    <Popup>
                      <div className="font-mono text-xs">
                        <p className="font-bold text-emerald-700">
                          {isHi ? 'प्रारंभ बिंदु' : 'Start Point'}
                        </p>
                        <p className="text-slate-500">
                          {result.summary.startTime &&
                            format(new Date(result.summary.startTime), 'HH:mm:ss')}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                  <Marker position={routeCoords[routeCoords.length - 1]} icon={endIcon}>
                    <Popup>
                      <div className="font-mono text-xs">
                        <p className="font-bold text-red-700">
                          {isHi ? 'समाप्त बिंदु' : 'End Point'}
                        </p>
                        <p className="text-slate-500">
                          {result.summary.endTime &&
                            format(new Date(result.summary.endTime), 'HH:mm:ss')}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Footer Strip */}
              <div
                className={cn(
                  "px-4 py-1.5 border-t transition-colors",
                  isFullscreen
                    ? "bg-[#0a1628] border-slate-700 text-slate-300 shrink-0"
                    : "bg-[#f0f4f9] border-slate-300 text-slate-500"
                )}
              >
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <p>
                    {isHi
                      ? 'रूट ऑडिट लॉग | जिला पंचायत सफाई | उत्तराखंड'
                      : 'Route Audit Log | Zila Panchayat Safai | Uttarakhand'}
                  </p>
                  {isFullscreen && (
                    <p className="text-amber-400 hidden sm:block">
                      {isHi ? 'बाहर निकलने के लिए ESC कुंजी दबाएं' : 'Press ESC key to exit big screen'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial empty state */}
      {!result && !loading && (
        <div className="bg-white border border-slate-300 rounded p-10 text-center">
          <History className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-normal">
            {isHi ? 'वाहन और दिनांक चुनें' : 'Select a Vehicle and Date'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            {isHi ? 'ऊपर एक वाहन और तिथि चुनें, फिर \'इतिहास देखें\' पर क्लिक करें' : "Choose a vehicle and date above, then click 'View History'"}
          </p>
        </div>
      )}
    </div>
  );
});
