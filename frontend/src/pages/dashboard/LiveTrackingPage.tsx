import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { trackingService } from '@/services/tracking.service';
import { useRealtime } from '@/hooks/useRealtime';
import { EmptyState } from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Truck, Radio, Clock, Gauge } from 'lucide-react';
import type { VehicleCurrentLocation } from '@/types';
import { format } from 'date-fns';

// Custom marker icons
const createIcon = (color: string) =>
  L.divIcon({
    className: 'custom-marker',
    html: `<div style="width:32px;height:32px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
      </svg>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

const markerIcons = {
  moving: createIcon('#22C55E'),
  idle: createIcon('#F97316'),
  offline: createIcon('#94A3B8'),
};

function MapUpdater({ locations }: { locations: VehicleCurrentLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = L.latLngBounds(locations.map((l) => [l.latitude, l.longitude]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [locations, map]);

  return null;
}

export function LiveTrackingPage() {
  const [locations, setLocations] = useState<VehicleCurrentLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleCurrentLocation | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Realtime updates for vehicle locations
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
      setLocations(data.locations);
    } catch (err) {
      console.error('Failed to fetch live locations:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-fade-in space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-poppins text-2xl font-bold text-navy-900">Live Vehicle Tracking</h1>
          <p className="text-sm text-secondary-text mt-1">
            {locations.length > 0
              ? `${locations.length} vehicle(s) with GPS data`
              : 'Waiting for GPS data from vehicles'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-secondary-text">
            <span className="w-2.5 h-2.5 rounded-full bg-success" /> Moving
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary-text">
            <span className="w-2.5 h-2.5 rounded-full bg-accent" /> Idle
          </div>
          <div className="flex items-center gap-1.5 text-xs text-secondary-text">
            <span className="w-2.5 h-2.5 rounded-full bg-navy-300" /> Offline
          </div>
        </div>
      </div>

      {locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No Live GPS Data Available"
          description="No GPS devices are currently sending location data. Once physical GPS devices are installed in garbage vehicles and connected through Traccar, live tracking data will appear here automatically."
        />
      ) : (
        <div className="grid lg:grid-cols-4 gap-4">
          {/* Map */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-border overflow-hidden shadow-sm h-[500px] lg:h-[600px]">
            <MapContainer
              center={[23.2599, 77.4126]}
              zoom={12}
              className="h-full w-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapUpdater locations={locations} />
              {locations.map((loc) => (
                <Marker
                  key={loc.vehicle_id}
                  position={[loc.latitude, loc.longitude]}
                  icon={markerIcons[loc.status] || markerIcons.offline}
                  eventHandlers={{
                    click: () => setSelectedVehicle(loc),
                  }}
                >
                  <Popup>
                    <div className="font-inter text-sm p-1">
                      <p className="font-semibold text-navy-900">
                        {(loc as any).vehicles?.vehicle_number || 'Vehicle'}
                      </p>
                      <p className="text-xs text-secondary-text mt-1">
                        Speed: {loc.speed?.toFixed(1)} km/h
                      </p>
                      <p className="text-xs text-secondary-text">
                        Updated: {format(new Date(loc.updated_at), 'HH:mm:ss')}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Vehicle list */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            <h3 className="font-poppins font-semibold text-sm text-navy-900 mb-3">Vehicles</h3>
            {locations.map((loc) => (
              <button
                key={loc.vehicle_id}
                onClick={() => setSelectedVehicle(loc)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-200 ${
                  selectedVehicle?.vehicle_id === loc.vehicle_id
                    ? 'border-primary bg-primary-50'
                    : 'border-border bg-white hover:border-primary/30'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-navy-900">
                    {(loc as any).vehicles?.vehicle_number || 'Vehicle'}
                  </span>
                  <Badge variant={loc.status as any}>{loc.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-secondary-text">
                  <span className="flex items-center gap-1">
                    <Gauge className="w-3 h-3" />
                    {loc.speed?.toFixed(0)} km/h
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {format(new Date(loc.updated_at), 'HH:mm')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
