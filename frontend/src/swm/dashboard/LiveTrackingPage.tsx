import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cn } from '@/lib/utils';
import { trackingService } from '@/services/tracking.service';
import { useRealtime } from '@/hooks/useRealtime';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  MapPin, Truck, Radio, Clock, Gauge, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Search, ShieldCheck, Expand, Activity
} from 'lucide-react';
import type { VehicleCurrentLocation } from '@/types';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

// Clean Map Tile Layers (Google Maps and Satellite View)
const TILE_LAYERS = {
  google: {
    name: 'Google Maps',
    nameHi: 'गूगल मैप्स',
    url: 'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
  },
  satellite: {
    name: 'Satellite View',
    nameHi: 'सैटेलाइट व्यू',
    url: 'https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    subdomains: ['0', '1', '2', '3'],
    attribution: '&copy; Google Maps',
  },
};

// Custom high-contrast Leaflet SVG vehicle markers
// If MilliTrack reports speed > 0: marker glows with pulsing green radar and heading arrow
// If MilliTrack reports speed === 0: marker stays stable in parked/idle state
const createCustomMarker = (
  status: string,
  vehicleNumber: string,
  heading: number = 0,
  speed: number = 0,
  isSelected: boolean = false,
  isHi: boolean = false
) => {
  const isMoving = status === 'moving' && speed >= 5;
  const isIdle = status !== 'moving' || speed < 5;
  const themeBg = isMoving ? '#10B981' : isIdle ? '#F59E0B' : '#64748B';
  const ringBg = isMoving ? 'rgba(16, 185, 129, 0.45)' : 'transparent';

  return L.divIcon({
    className: 'custom-vehicle-marker-wrapper',
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center; user-select:none; pointer-events:auto; cursor:pointer;">
        <!-- Vehicle Plate & Speed Badge -->
        <div style="background:#081325; color:#ffffff; font-family:ui-monospace, SFMono-Regular, monospace; font-size:10px; font-weight:800; padding:2px 7px; border-radius:5px; border:${isSelected ? '2px solid #fbbf24' : '1px solid #2563eb'}; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.5); display:flex; align-items:center; gap:4px; margin-bottom:4px; transform:${isSelected ? 'scale(1.08)' : 'scale(1)'}; transition:all 0.2s ease;">
          <span>${vehicleNumber}</span>
          <span style="color:${isMoving ? '#34d399' : '#fbbf24'}; font-weight:700;">
            • ${isMoving ? `${speed.toFixed(0)} ${isHi ? 'किमी/घंटा' : 'km/h'}` : ` ${isHi ? 'पार्क' : 'Parked'}`}
          </span>
        </div>

        <!-- Live Radar Wave: Appears ONLY when vehicle is genuinely moving in MilliTrack -->
        ${isMoving ? `
          <div class="live-radar-ping" style="position:absolute; top:20px; width:44px; height:44px; border-radius:50%; background:${ringBg}; pointer-events:none; z-index:1;"></div>
        ` : ''}

        <!-- Vehicle Body with Directional Orientation from MilliTrack course -->
        <div style="position:relative; z-index:2; width:38px; height:38px; border-radius:50%; background:${themeBg}; border:3px solid #ffffff; box-shadow:0 4px 12px rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; transform:rotate(${heading}deg); transition:transform 0.4s ease-out;">
          <!-- Front Heading Triangle Pointer (points in travel direction when moving) -->
          ${isMoving ? `
            <div style="position:absolute; top:-7px; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-bottom:7px solid #fbbf24; filter:drop-shadow(0 1px 2px rgba(0,0,0,0.5));"></div>
          ` : ''}
          
          <!-- Garbage Truck Icon -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="transform:rotate(-${heading}deg);">
            <path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [120, 64],
    iconAnchor: [60, 48],
    popupAnchor: [0, -48],
  });
};

// Map Controller Component for zoom, flyTo, fitBounds and smooth trackpad/wheel page scroll
function MapControlsHandler({
  selectedVehicle,
}: {
  selectedVehicle: VehicleCurrentLocation | null;
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
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [map]);

  // Handle vehicle focus
  useEffect(() => {
    if (selectedVehicle) {
      map.flyTo([selectedVehicle.latitude, selectedVehicle.longitude], 15, {
        animate: true,
        duration: 1.0,
      });
    }
  }, [selectedVehicle?.latitude, selectedVehicle?.longitude, map]);

  return null;
}

export const LiveTrackingPage = React.memo(() => {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === 'hi';

  const [locations, setLocations] = useState<VehicleCurrentLocation[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCurrentLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLayer, setCurrentLayer] = useState<keyof typeof TILE_LAYERS>('google');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const initialFitDoneRef = useRef(false);

  // Default Center: Almora District
  const defaultCenter: [number, number] = [29.6139, 79.6200];

  // Fetch real locations from backend (which syncs from MilliTrack)
  // Fetch real locations from backend (which syncs from MilliTrack)
  const fetchLocations = useCallback(async () => {
    try {
      const data = await trackingService.getLive();
      if (data.locations && data.locations.length > 0) {
        setLocations((prev) => {
          if (prev.length === 0) return data.locations;

          // Check if any vehicle actually changed coordinates, speed, or status
          let hasActualChange = false;
          const merged = data.locations.map((rawLoc) => {
            const normalizedSpeed = rawLoc.status === 'moving' && (rawLoc.speed || 0) >= 5 ? rawLoc.speed : 0;
            const newLoc = { ...rawLoc, speed: normalizedSpeed };
            const oldLoc = prev.find((p) => p.vehicle_id === newLoc.vehicle_id);
            if (!oldLoc) {
              hasActualChange = true;
              return newLoc;
            }

            const isLatChanged = Math.abs(oldLoc.latitude - newLoc.latitude) > 0.00005;
            const isLngChanged = Math.abs(oldLoc.longitude - newLoc.longitude) > 0.00005;
            const isSpeedChanged = Math.abs((oldLoc.speed || 0) - (newLoc.speed || 0)) > 2;
            const isStatusChanged = oldLoc.status !== newLoc.status;

            if (isLatChanged || isLngChanged || isSpeedChanged || isStatusChanged) {
              hasActualChange = true;
              return {
                ...oldLoc,
                ...newLoc,
                vehicle: newLoc.vehicle || oldLoc.vehicle,
              };
            }

            // Return identical reference to prevent card re-renders
            return oldLoc;
          });

          if (!hasActualChange && prev.length === data.locations.length) {
            return prev; // Skip React re-render completely!
          }

          return merged;
        });

        // Initial fit bounds to encompass all real MilliTrack vehicles
        if (!initialFitDoneRef.current && mapRef.current && data.locations.length > 0) {
          const validCoords = data.locations
            .filter((l) => l.latitude && l.longitude && l.latitude > 20 && l.longitude > 70)
            .map((l) => [l.latitude, l.longitude] as [number, number]);

          if (validCoords.length > 0) {
            const bounds = L.latLngBounds(validCoords);
            mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            initialFitDoneRef.current = true;
          }
        }
      }
    } catch (err) {
      console.warn('Realtime live location fetch:', err);
    }
  }, []);

  // Initial load + Gentle Background Polling (15s)
  useEffect(() => {
    fetchLocations();

    const pollInterval = setInterval(() => {
      fetchLocations();
    }, 15000);

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
      clearInterval(pollInterval);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [fetchLocations]);

  // Realtime WebSocket subscription from backend MilliTrack events
  useRealtime<{ type: string; new: VehicleCurrentLocation }>(
    'location_update',
    (payload) => {
      const rawLoc = ((payload as any).new || payload) as VehicleCurrentLocation;
      if (rawLoc && rawLoc.vehicle_id) {
        const normalizedSpeed = rawLoc.status === 'moving' && (rawLoc.speed || 0) >= 5 ? rawLoc.speed : 0;
        const updatedLoc = { ...rawLoc, speed: normalizedSpeed };
        setLocations((prev) => {
          const idx = prev.findIndex((l) => l.vehicle_id === updatedLoc.vehicle_id);
          if (idx >= 0) {
            const old = prev[idx];
            const isLatChanged = Math.abs(old.latitude - updatedLoc.latitude) > 0.00005;
            const isLngChanged = Math.abs(old.longitude - updatedLoc.longitude) > 0.00005;
            const isSpeedChanged = Math.abs((old.speed || 0) - (updatedLoc.speed || 0)) > 2;
            const isStatusChanged = old.status !== updatedLoc.status;

            if (!isLatChanged && !isLngChanged && !isSpeedChanged && !isStatusChanged) {
              return prev; // No motion: skip re-rendering!
            }

            const updatedList = [...prev];
            updatedList[idx] = {
              ...old,
              ...updatedLoc,
              vehicle: updatedLoc.vehicle || old.vehicle,
            };
            return updatedList;
          }
          return [...prev, updatedLoc];
        });

        // Sync selected vehicle if currently focused
        if (selectedVehicle && selectedVehicle.vehicle_id === updatedLoc.vehicle_id) {
          setSelectedVehicle((prev) => (prev ? { ...prev, ...updatedLoc, vehicle: updatedLoc.vehicle || prev.vehicle } : null));
        }
      }
    },
    'live_locations'
  );

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

  // Filtered vehicles list
  const filteredLocations = locations.filter((loc) => {
    const vNum = (loc as any).vehicle?.vehicle_number || '';
    const vName = (loc as any).vehicle?.vehicle_name || '';
    return (
      vNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const movingCount = locations.filter((l) => l.status === 'moving' && (l.speed || 0) >= 5).length;
  const idleCount = locations.filter((l) => l.status !== 'offline' && (l.status !== 'moving' || (l.speed || 0) < 5)).length;
  const offlineCount = locations.filter((l) => l.status === 'offline').length;

  const handleZoomIn = () => {
    if (mapRef.current) mapRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapRef.current) mapRef.current.zoomOut();
  };

  const handleRecenterAll = () => {
    if (mapRef.current && locations.length > 0) {
      const validCoords = locations
        .filter((l) => l.latitude && l.longitude && l.latitude > 20 && l.longitude > 70)
        .map((l) => [l.latitude, l.longitude] as [number, number]);

      if (validCoords.length > 0) {
        const bounds = L.latLngBounds(validCoords);
        mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
        return;
      }
    }
    if (mapRef.current) {
      mapRef.current.setView(defaultCenter, 13);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">

      <div className="grid lg:grid-cols-4 gap-4 items-start">
        {/* Main GIS Map Console */}
        <div
          ref={mapContainerRef}
          className={cn(
            "lg:col-span-3 bg-white rounded-xl border border-slate-300 overflow-hidden shadow-md relative flex flex-col transition-all duration-200",
            isFullscreen ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none" : "h-[75vh] sm:h-[500px] lg:h-[620px]"
          )}
        >
          {/* Clean, Uncluttered Top Map Bar */}
          <div className="bg-[#081325] text-white px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 z-20 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-poppins text-xs font-bold uppercase tracking-wide text-slate-100">
                {isHi ? 'लाइव जीपीएस मैप' : ' Live GPS Map'}
              </span>
            </div>

            {/* Clean Map Layer Controls (OpenStreetMap & Satellite View) & Fullscreen Button */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline mr-1 shrink-0">{isHi ? 'मैप:' : 'Map:'}</span>
              {(Object.keys(TILE_LAYERS) as Array<keyof typeof TILE_LAYERS>).map((layerKey) => (
                <button
                  key={layerKey}
                  onClick={() => setCurrentLayer(layerKey)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded transition-all shrink-0 ${
                    currentLayer === layerKey
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  {isHi ? TILE_LAYERS[layerKey].nameHi : TILE_LAYERS[layerKey].name}
                </button>
              ))}

              <button
                onClick={toggleFullscreen}
                title={isFullscreen ? "Exit Fullscreen Mode" : "Expand to Fullscreen Map"}
                className="ml-1 px-2.5 py-1 text-[11px] font-bold rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 shadow-xs transition-colors shrink-0"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{isHi ? 'बाहर निकलें' : 'Exit'}</span>
                  </>
                ) : (
                  <>
                    <Expand className="w-3.5 h-3.5 shrink-0" />
                    <span className="hidden sm:inline">{isHi ? 'पूरा स्क्रीन' : 'Fullscreen'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Interactive Leaflet Map Canvas */}
          <div className="relative flex-1 w-full h-full">
            <MapContainer
              center={defaultCenter}
              zoom={13}
              className="h-full w-full"
              zoomControl={false}
              ref={mapRef}
              scrollWheelZoom={false}
              touchZoom={false}
              dragging={true}
              doubleClickZoom={true}
              attributionControl={false}
              preferCanvas={true}
            >
              <TileLayer
                attribution={TILE_LAYERS[currentLayer].attribution}
                url={TILE_LAYERS[currentLayer].url}
                subdomains={TILE_LAYERS[currentLayer].subdomains}
              />
              <MapControlsHandler
                selectedVehicle={selectedVehicle}
              />

              {/* Real Vehicle Leaflet Markers from MilliTrack */}
              {(selectedVehicle ? [selectedVehicle] : locations).map((loc) => {
                const vNumber = (loc as any).vehicle?.vehicle_number || 'Vehicle';
                const isSelected = selectedVehicle?.vehicle_id === loc.vehicle_id;
                const speed = loc.speed || 0;
                const heading = loc.heading || 0;

                return (
                  <Marker
                    key={loc.vehicle_id}
                    position={[loc.latitude, loc.longitude]}
                    icon={createCustomMarker(
                      loc.status,
                      vNumber,
                      heading,
                      speed,
                      isSelected,
                      isHi
                    )}
                    eventHandlers={{
                      click: () => {
                        setSelectedVehicle(loc);
                      },
                    }}
                  >
                    <Popup className="gov-map-popup">
                      <div className="p-2 min-w-[220px] font-inter text-xs">
                        <div className="bg-navy-950 text-white px-2.5 py-1.5 rounded font-mono font-bold text-xs mb-2 flex items-center justify-between border-b border-navy-800">
                          <span>{vNumber}</span>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                              loc.status === 'moving' && speed >= 5 ? "bg-emerald-800 text-emerald-200" : "bg-amber-800 text-amber-200"
                            )}
                          >
                            {loc.status === 'moving' && speed >= 5 ? (isHi ? 'चालू' : 'Moving') : (isHi ? 'पार्क्ड' : 'Parked')}
                          </span>
                        </div>
                        <div className="space-y-1 text-slate-700">
                          <p className="flex justify-between">
                            <span className="text-slate-500">{isHi ? 'लाइव गति:' : 'Live Speed:'}</span>
                            <span className="font-bold text-navy-900 font-mono text-emerald-700">
                              {loc.status === 'moving' && speed >= 5 ? `${speed.toFixed(1)} ${isHi ? 'किमी/घंटा' : 'km/h'}` : (isHi ? '0 किमी/घंटा' : '0 km/h')}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">{isHi ? 'दिशा:' : 'Heading:'}</span>
                            <span className="font-mono text-slate-700">{heading}°</span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">{isHi ? 'वाहन का नाम:' : 'Vehicle Name:'}</span>
                            <span className="font-bold text-slate-800 text-[11px] truncate max-w-[130px]">
                              {(loc as any).vehicle?.vehicle_name || 'Safai Truck'}
                            </span>
                          </p>
                          <p className="flex justify-between">
                            <span className="text-slate-500">{isHi ? 'जीपीएस निर्देशांक:' : 'GPS Coords:'}</span>
                            <span className="font-mono text-[11px] text-slate-600">
                              {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                            </span>
                          </p>
                          <p className="flex justify-between border-t border-slate-200 pt-1 mt-1 text-[11px] text-slate-500">
                            <span>{isHi ? 'पिग:' : 'Ping:'}</span>
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
            {selectedVehicle && (() => {
              const isSelectedMoving = selectedVehicle.status === 'moving' && (selectedVehicle.speed || 0) >= 5;
              return (
                <div className="absolute top-4 left-4 z-[400] bg-navy-950/95 text-white border border-navy-700 rounded-lg px-3.5 py-2 shadow-xl flex items-center gap-3 backdrop-blur-xs font-mono text-xs">
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    isSelectedMoving ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                  )} />
                  <div>
                    <span className="text-[10px] text-slate-300 font-bold uppercase block">{isHi ? "फोकस्ड ट्रैकिंग" : "Focused Tracking"}</span>
                    <span className="font-bold text-amber-400">
                      {(selectedVehicle as any).vehicle?.vehicle_number || 'Selected Vehicle'}
                    </span>
                    <span className="text-[11px] text-emerald-400 ml-2 font-bold">
                      {isSelectedMoving ? `${(selectedVehicle.speed || 0).toFixed(1)} ${isHi ? 'किमी/घंटा' : 'km/h'}` : (isHi ? 'पार्क किया गया' : 'Parked')}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedVehicle(null)}
                    className="ml-2 px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px] uppercase transition-colors"
                  >
                    {isHi ? "सभी वाहन दिखाएं" : "Show All Vehicle"}
                  </button>
                </div>
              );
            })()}

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
        <div className="bg-white rounded-xl border border-slate-300 p-4 shadow-sm flex flex-col h-[500px] lg:h-[620px]">
          {/* Panel Header & Search */}
          <div className="pb-3 mb-3 border-b border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-poppins font-bold text-[14px] text-navy-900 flex items-center gap-1.5">{isHi ? 'सक्रिय वाहन सूची:' : 'Active Vehicles List:'}</h3>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder={isHi ? 'वाहन संख्या खोजें...' : 'Search vehicle number...'}
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
                const vNumber = (loc as any).vehicle?.vehicle_number || 'Vehicle';
                const vName = (loc as any).vehicle?.vehicle_name;
                const isSelected = selectedVehicle?.vehicle_id === loc.vehicle_id;
                const speed = loc.speed || 0;
                const isMoving = loc.status === 'moving' && speed >= 5;

                return (
                  <button
                    key={loc.vehicle_id}
                    onClick={() => {
                      setSelectedVehicle(loc);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all duration-150 relative ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-2 bottom-2 w-1.5 bg-emerald-600 rounded-r-md" />
                    )}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            isMoving ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                          )}
                        />
                        <span className="font-mono font-bold text-xs text-navy-900">
                          {vNumber}
                        </span>
                      </div>
                      <Badge
                        variant={isMoving ? 'moving' : 'idle'}
                        className="text-[10px] uppercase font-bold"
                      >
                        {isHi ? (isMoving ? 'चल रहा है' : 'पार्कड') : (isMoving ? 'Moving' : 'Parked')}
                      </Badge>
                    </div>

                    {vName && (
                      <p className="text-xs text-slate-600 font-medium mb-1 truncate">{vName}</p>
                    )}

                    <div className="text-[10px] text-slate-400 font-mono mb-1 truncate flex items-center gap-1">
                      <span>{isHi ? 'जीपीएस:' : 'GPS:'} {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1.5 border-t border-slate-100">
                      <span className={cn(
                        "flex items-center gap-1 font-bold",
                        isMoving ? "text-emerald-700" : "text-amber-700"
                      )}>
                        {isMoving ? `${speed.toFixed(0)} ${isHi ? 'किमी/घंटा' : 'km/h'}` : `0 ${isHi ? 'किमी/घंटा' : 'km/h'}`}
                      </span>
                      <span className="flex items-center gap-1">
                        {format(new Date(loc.updated_at), 'HH:mm:ss')}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Selected Vehicle Single Isolation Telemetry Card */}
          {selectedVehicle && (() => {
            const isSelectedMoving = selectedVehicle.status === 'moving' && (selectedVehicle.speed || 0) >= 5;
            return (
              <div className="mt-3 pt-3 border-t bg-navy-950 text-white p-3 rounded-lg border border-navy-800 shadow-md font-mono space-y-2">
                <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      isSelectedMoving ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                    )} />
                    <span className="text-xs font-bold text-amber-400">
                      {(selectedVehicle as any).vehicle?.vehicle_number}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">{isHi ? 'गति:' : 'Speed:'}</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {isSelectedMoving ? `${(selectedVehicle.speed || 0).toFixed(1)} ${isHi ? 'किमी/घंटा' : 'km/h'}` : `0 ${isHi ? 'किमी/घंटा' : 'km/h'}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase block">{isHi ? 'दिशा' : 'Heading'}</span>
                    <span className="font-bold text-amber-300 font-mono">
                      {selectedVehicle.heading || 0}°
                    </span>
                  </div>
                </div>

                <div className="pt-1 border-t border-navy-800 text-[10px] text-slate-400 space-y-0.5">
                  <p className="truncate">{isHi ? 'जीपीएस:' : 'GPS:'} {selectedVehicle.latitude.toFixed(5)}, {selectedVehicle.longitude.toFixed(5)}</p>
                  <p>{isHi ? 'पिग:' : 'Ping:'} {format(new Date(selectedVehicle.updated_at), 'yyyy-MM-dd HH:mm:ss')}</p>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
});
