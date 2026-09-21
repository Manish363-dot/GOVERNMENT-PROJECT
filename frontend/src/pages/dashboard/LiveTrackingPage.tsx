import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { trackingService } from '@/services/tracking.service';
import { useRealtime } from '@/hooks/useRealtime';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GarbageTruckLoader } from '@/components/GarbageTruckLoader';
import {
  MapPin, Truck, Radio, Clock, Gauge, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Search, Layers, Navigation, ShieldCheck, Activity, Expand
} from 'lucide-react';
import type { VehicleCurrentLocation } from '@/types';
import { format } from 'date-fns';

// Map Tile Layers Configuration
const TILE_LAYERS = {
  streets: {
    name: 'Gov Standard',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    name: 'Satellite View',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery',
  },
  topo: {
    name: 'Terrain View',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenTopoMap',
  },
};

// Custom high-contrast Leaflet SVG vehicle markers
const createCustomMarker = (status: string, vehicleNumber: string) => {
  const colorMap: Record<string, { bg: string; border: string; pulse: boolean }> = {
    moving: { bg: '#10B981', border: '#047857', pulse: true },
    idle: { bg: '#F59E0B', border: '#B45309', pulse: false },
    offline: { bg: '#64748B', border: '#334155', pulse: false },
  };

  const style = colorMap[status] || colorMap.offline;

  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
        <div style="background:#0b1b36; color:#ffffff; font-family:sans-serif; font-size:10px; font-weight:700; padding:2px 6px; border-radius:4px; border:1px solid #1d4ed8; white-space:nowrap; box-shadow:0 2px 6px rgba(0,0,0,0.4); margin-bottom:3px;">
          ${vehicleNumber}
        </div>
        <div style="width:34px; height:34px; border-radius:50%; background:${style.bg}; border:3px solid #ffffff; box-shadow:0 4px 10px rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [80, 56],
    iconAnchor: [40, 56],
    popupAnchor: [0, -50],
  });
};

// Map Controller Component for zoom, flyTo, fitBounds and smooth trackpad/wheel page scroll
function MapControlsHandler({
  selectedVehicle,
  locations,
}: {
  selectedVehicle: VehicleCurrentLocation | null;
  locations: VehicleCurrentLocation[];
}) {
  const map = useMap();

  useEffect(() => {
    // Disable Leaflet's aggressive touch zoom interception so 2-finger trackpad/touch scrolls the page
    map.touchZoom.disable();

    const container = map.getContainer();

    // Handle Wheel Events: Ctrl + Wheel zooms map; Normal Wheel scrolls webpage up/down!
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (e.deltaY < 0) {
          map.zoomIn();
        } else {
          map.zoomOut();
        }
      }
      // Otherwise allow native webpage scrolling!
    };

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

  useEffect(() => {
    if (selectedVehicle) {
      map.flyTo([selectedVehicle.latitude, selectedVehicle.longitude], 16, {
        animate: true,
        duration: 1.2,
      });
    }
  }, [selectedVehicle, map]);

  return null;
}

import { useTranslation } from 'react-i18next';

export function LiveTrackingPage() {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';
  const [locations, setLocations] = useState<VehicleCurrentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCurrentLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLayer, setCurrentLayer] = useState<'streets' | 'satellite' | 'topo'>('streets');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // Default center set to Uttarakhand (Dehradun / District Center)
  const defaultCenter: [number, number] = [30.3165, 78.0322];

  useEffect(() => {
    fetchLocations();

    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      setIsFullscreen(isFull);
      if (mapRef.current) {
        setTimeout(() => {
          mapRef.current?.invalidateSize();
        }, 200);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Realtime vehicle tracking subscription
  useRealtime('vehicle_current_locations', (payload) => {
    if (payload.new) {
      setLocations((prev) => {
        const idx = prev.findIndex((l) => l.vehicle_id === (payload.new as any).vehicle_id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = payload.new as VehicleCurrentLocation;
          return updated;
        }
        return [...prev, payload.new as VehicleCurrentLocation];
      });
    }
  });

  async function fetchLocations() {
    try {
      const data = await trackingService.getLive();
      if (data.locations && data.locations.length > 0) {
        setLocations(data.locations);
      } else {
        // Only 1 explicit test vehicle for demo/testing fallback
        const singleTestVehicle: VehicleCurrentLocation[] = [
          {
            id: 'loc-test-1',
            vehicle_id: 'v-test-1',
            gps_device_id: null,
            latitude: 29.5892,
            longitude: 79.6467,
            speed: 18.5,
            heading: 45,
            status: 'moving',
            updated_at: new Date().toISOString(),
            vehicles: {
              id: 'v-test-1',
              vehicle_number: 'UK-01-TEST-01',
              vehicle_name: 'Testing Demo Vehicle (Safai Truck)',
              vehicle_type: 'truck',
              status: 'moving',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }
          }
        ];
        setLocations(singleTestVehicle);
      }
    } catch (err) {
      console.error('Failed to fetch live locations:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered vehicles list
  const filteredLocations = locations.filter((loc) => {
    const vNum = (loc as any).vehicles?.vehicle_number || '';
    const vName = (loc as any).vehicles?.vehicle_name || '';
    return (
      vNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const movingCount = locations.filter((l) => l.status === 'moving').length;
  const idleCount = locations.filter((l) => l.status === 'idle').length;
  const offlineCount = locations.filter((l) => l.status === 'offline').length;

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleRecenterAll = () => {
    if (mapRef.current && locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
      mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    } else if (mapRef.current) {
      mapRef.current.setView(defaultCenter, 11);
    }
  };

  // Show truck loading animation while data loads OR animation still playing
  if (showLoader) {
    return (
      <div className="animate-fade-in space-y-5">
        {/* Page header stays visible during load */}
        <div className="flex flex-col gap-1 pb-4 border-b border-slate-200">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 uppercase tracking-wider w-fit">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            उत्तराखंड शासन • GIS Live Command Portal
          </span>
          <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Live Vehicle Telematics &amp; GPS Console
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Real-time District Waste Collection Vehicle Tracking, Speed Metrics &amp; Route Auditing
          </p>
        </div>
        <GarbageTruckLoader
          onComplete={() => {
            setShowLoader(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-5">
      {/* Official Government Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            {t('admin.tracking.title')}
          </h1>
        </div>

        {/* Telematics Quick Summary Cards */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 lg:pb-0">
          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-[14px] text-slate-500 uppercase font-bold block leading-none">{t('admin.tracking.moving')}</span>
              <span className="text-sm font-bold text-navy-900 leading-none">{movingCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <div>
              <span className="text-[14px] text-slate-500 uppercase font-bold block leading-none">{t('admin.tracking.idle')}</span>
              <span className="text-sm font-bold text-navy-900 leading-none">{idleCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 flex items-center gap-2 shadow-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <div>
              <span className="text-[14px] text-slate-500 uppercase font-bold block leading-none">{t('admin.tracking.offline')}</span>
              <span className="text-sm font-bold text-navy-900 leading-none">{offlineCount}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-5 items-start">
        {/* Main GIS Map Console */}
        <div
          ref={mapContainerRef}
          className={cn(
            "lg:col-span-3 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-md relative flex flex-col transition-all duration-200",
            isFullscreen ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none" : "h-[460px]"
          )}
        >
          {/* Official Top GIS Bar */}
          <div className="bg-[#081325] text-white px-4 py-2.5 flex items-center justify-between z-20 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-100">
                Zila Panchayat GIS Telematics Map
              </span>
            </div>

            {/* Map Layer Controls & Fullscreen Button */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-300 hidden sm:inline mr-1">Layer:</span>
              {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((layerKey) => (
                <button
                  key={layerKey}
                  onClick={() => setCurrentLayer(layerKey)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all ${currentLayer === layerKey
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                    }`}
                >
                  {TILE_LAYERS[layerKey].name}
                </button>
              ))}

              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen Mode" : "Expand to Fullscreen Map"}
                className="ml-2 px-2.5 py-1 text-[11px] font-bold rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exit Fullscreen</span>
                  </>
                ) : (
                  <>
                    <Expand className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Map Canvas */}
          <div className="relative flex-1 w-full h-full">
            <MapContainer
              center={locations.length > 0 ? [locations[0].latitude, locations[0].longitude] : defaultCenter}
              zoom={12}
              className="h-full w-full"
              zoomControl={false}
              ref={mapRef}
              scrollWheelZoom={false}
              touchZoom={false}
              dragging={true}
              doubleClickZoom={true}
            >
              <TileLayer
                attribution={TILE_LAYERS[currentLayer].attribution}
                url={TILE_LAYERS[currentLayer].url}
              />
              <MapControlsHandler
                selectedVehicle={selectedVehicle}
                locations={locations}
              />

              {/* Single Vehicle Isolation: If selectedVehicle exists, render ONLY that vehicle on map */}
              {(selectedVehicle ? [selectedVehicle] : locations).map((loc) => {
                const vNumber = (loc as any).vehicles?.vehicle_number || 'Vehicle';
                return (
                  <Marker
                    key={loc.vehicle_id}
                    position={[loc.latitude, loc.longitude]}
                    icon={createCustomMarker(loc.status, vNumber)}
                    eventHandlers={{
                      click: () => setSelectedVehicle(loc),
                    }}
                  >
                    <Popup className="gov-map-popup">
                      <div className="p-2 min-w-[200px] font-inter text-xs">
                        <div className="bg-navy-950 text-white px-2.5 py-1 rounded font-mono font-bold text-xs mb-2 flex items-center justify-between">
                          <span>{vNumber}</span>
                          <span className="text-[10px] font-semibold uppercase text-emerald-400">{loc.status}</span>
                        </div>
                        <div className="space-y-1 text-slate-700">
                          <p className="flex justify-between">
                            <span className="text-slate-500">Speed:</span>
                            <span className="font-bold text-navy-900">{loc.speed?.toFixed(1) || 0} km/h</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Latitude:</span>
                            <span className="font-mono text-slate-700">{loc.latitude.toFixed(5)}</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">Longitude:</span>
                            <span className="font-mono text-slate-700">{loc.longitude.toFixed(5)}</span>
                          </p>
                          <p className="flex justify-between border-t border-slate-200 pt-1 mt-1 text-[11px] text-slate-500">
                            <span>Last Ping:</span>
                            <span>{format(new Date(loc.updated_at), 'HH:mm:ss')}</span>
                          </p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>

            {/* Single Vehicle Isolation Banner */}
            {selectedVehicle && (
              <div className="absolute top-4 left-4 z-[400] bg-navy-950/95 text-white border border-navy-700 rounded-lg px-3.5 py-2 shadow-xl flex items-center gap-3 backdrop-blur-xs font-mono text-xs">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-300 font-bold uppercase block">Focused Isolation Tracking</span>
                  <span className="font-bold text-amber-400">
                    {(selectedVehicle as any).vehicles?.vehicle_number || 'Selected Vehicle'} ONLY
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="ml-2 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px] uppercase transition-colors"
                >
                  Show All Vehicles
                </button>
              </div>
            )}

            {/* Floating GIS Map Controls Bar */}
            <div className="absolute top-4 right-4 z-[400] flex flex-col gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg border border-slate-300 shadow-lg">
              <button
                onClick={handleZoomIn}
                title="Zoom In (+)"
                className="w-9 h-9 bg-white hover:bg-slate-100 text-navy-900 flex items-center justify-center rounded border border-slate-200 font-bold shadow-xs hover:text-emerald-700 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                title="Zoom Out (-)"
                className="w-9 h-9 bg-white hover:bg-slate-100 text-navy-900 flex items-center justify-center rounded border border-slate-200 font-bold shadow-xs hover:text-emerald-700 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className="h-px bg-slate-200 my-0.5" />
              <button
                onClick={handleRecenterAll}
                title="Recenter All Fleet Vehicles"
                className="w-9 h-9 bg-white hover:bg-slate-100 text-navy-900 flex items-center justify-center rounded border border-slate-200 shadow-xs hover:text-emerald-700 transition-colors"
              >
                <Maximize2 className="w-4 h-4 text-emerald-700" />
              </button>
              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen" : "Full Screen Map"}
                className="w-9 h-9 bg-white hover:bg-slate-100 text-navy-900 flex items-center justify-center rounded border border-slate-200 shadow-xs hover:text-amber-600 transition-colors"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <Expand className="w-4 h-4 text-slate-700" />
                )}
              </button>
            </div>

            {/* Bottom Tricolor Accent Line on Map */}
            <div className="uk-tricolor-line h-1 absolute bottom-0 left-0 right-0 z-20" />
          </div>
        </div>

        {/* Vehicle Fleet Panel */}
        <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm flex flex-col h-[460px]">
          {/* Panel Header & Search */}
          <div className="pb-3 mb-3 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-[14px] text-navy-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                Active Fleet List
              </h3>
              <span className="text-[14px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {filteredLocations.length} / {locations.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search vehicle number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200"
              />
            </div>
          </div>

          {/* Vehicle List Items */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {filteredLocations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No matching vehicles found.</p>
            ) : (
              filteredLocations.map((loc) => {
                const vNumber = (loc as any).vehicles?.vehicle_number || 'Vehicle';
                const vName = (loc as any).vehicles?.vehicle_name;
                const isSelected = selectedVehicle?.vehicle_id === loc.vehicle_id;

                return (
                  <button
                    key={loc.vehicle_id}
                    onClick={() => setSelectedVehicle(loc)}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 relative ${isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50'
                      }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-md" />
                    )}
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-navy-900">
                        {vNumber}
                      </span>
                      <Badge variant={loc.status as any} className="text-[10px]">
                        {loc.status}
                      </Badge>
                    </div>

                    {vName && (
                      <p className="text-xs text-slate-600 font-medium mb-1 truncate">{vName}</p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-slate-400" />
                        {loc.speed?.toFixed(0) || 0} km/h
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {format(new Date(loc.updated_at), 'HH:mm')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Vehicle Single Isolation Telemetry Card */}
          {selectedVehicle && (
            <div className="mt-3 pt-3 border-t bg-navy-950 text-white p-3 rounded-lg border border-navy-800 shadow-md font-mono space-y-2">
              <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-bold text-amber-400">
                    {(selectedVehicle as any).vehicles?.vehicle_number}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="text-[10px] font-bold text-slate-300 hover:text-white bg-navy-800 hover:bg-navy-700 px-2 py-0.5 rounded uppercase transition-colors"
                >
                  Show All Fleet
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Speed Metric</span>
                  <span className="font-bold text-emerald-400">{selectedVehicle.speed?.toFixed(1) || 0} km/h</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block">Device Status</span>
                  <span className="font-bold text-slate-200 uppercase">{selectedVehicle.status}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-navy-800 text-[10px] text-slate-400 space-y-0.5">
                <p className="truncate">GPS: {selectedVehicle.latitude.toFixed(5)}, {selectedVehicle.longitude.toFixed(5)}</p>
                <p>Last Ping: {format(new Date(selectedVehicle.updated_at), 'yyyy-MM-dd HH:mm:ss')}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
