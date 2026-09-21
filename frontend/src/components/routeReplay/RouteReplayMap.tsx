import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { RouteReplayDataset, ReplayPoint } from '@/types/routeReplay';
import { CheckCircle2, AlertTriangle, ShieldAlert, Radio, Maximize2, Minimize2, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteReplayMapProps {
    dataset: RouteReplayDataset;
    currentPointIndex: number;
    onPointClick: (point: ReplayPoint) => void;
    followTruck: boolean;
    onToggleFollowTruck: () => void;
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
}

// Leaflet map controller for auto-centering
function MapRecenter({ center, zoom, follow }: { center: [number, number]; zoom?: number; follow: boolean }) {
    const map = useMap();
    useEffect(() => {
        if (follow && center && center[0] && center[1]) {
            map.panTo(center, { animate: true, duration: 0.3 });
        }
    }, [center, follow, map]);
    return null;
}

// Custom Leaflet Icons
const truckIcon = (heading: number, vehicleNumber: string) =>
    L.divIcon({
        className: 'custom-truck-marker',
        html: `
      <div style="position:relative; width:46px; height:46px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:-4px; border-radius:50%; background:rgba(245, 158, 11, 0.35); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
        <div style="width:40px; height:40px; border-radius:50%; background:#0a1628; border:2.5px solid #f59e0b; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(0,0,0,0.5);">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10 17h4V5H2v12h3"/>
            <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/>
            <circle cx="7.5" cy="17.5" r="2.5" fill="#f59e0b" stroke="#0a1628" stroke-width="1"/>
            <circle cx="17.5" cy="17.5" r="2.5" fill="#f59e0b" stroke="#0a1628" stroke-width="1"/>
          </svg>
        </div>
      </div>
    `,
        iconSize: [46, 46],
        iconAnchor: [23, 23],
    });

const startIcon = L.divIcon({
    className: 'custom-marker-start',
    html: `
    <div style="background:#16a34a; color:white; border:2px solid white; font-weight:bold; font-size:10px; padding:3px 6px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.3); font-family:sans-serif; display:flex; items-center; gap:3px;">
      <span>🏁</span> <span>START</span>
    </div>
  `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
});

const endIcon = L.divIcon({
    className: 'custom-marker-end',
    html: `
    <div style="background:#dc2626; color:white; border:2px solid white; font-weight:bold; font-size:10px; padding:3px 6px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.3); font-family:sans-serif; display:flex; items-center; gap:3px;">
      <span>🏁</span> <span>END</span>
    </div>
  `,
    iconSize: [52, 24],
    iconAnchor: [26, 12],
});

const collectionPointIcon = (isCompleted: boolean, name: string) =>
    L.divIcon({
        className: 'custom-col-marker',
        html: `
      <div style="width:26px; height:26px; border-radius:50%; background:${isCompleted ? '#10b981' : '#94a3b8'}; border:2px solid white; display:flex; align-items:center; justify-content:center; color:white; font-size:12px; font-weight:bold; box-shadow:0 2px 6px rgba(0,0,0,0.3);">
        ${isCompleted ? '✓' : '🗑'}
      </div>
    `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
    });

const stopIcon = (type: 'traffic' | 'idle' | 'unexpected', durationMin: number) =>
    L.divIcon({
        className: 'custom-stop-marker',
        html: `
      <div style="background:${type === 'unexpected' ? '#ef4444' : '#f59e0b'}; color:white; border:2px solid white; border-radius:50%; width:28px; height:28px; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:bold; box-shadow:0 2px 8px rgba(0,0,0,0.4); ${type === 'unexpected' ? 'animation:pulse 1s infinite;' : ''}">
        ⏱
      </div>
    `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });

const deviationIcon = L.divIcon({
    className: 'custom-dev-marker',
    html: `
    <div style="background:#3b82f6; color:white; border:2px solid white; border-radius:12px; padding:2px 6px; font-size:10px; font-weight:bold; box-shadow:0 2px 8px rgba(0,0,0,0.3);">
      🔵 DEVIATION
    </div>
  `,
    iconSize: [70, 22],
    iconAnchor: [35, 11],
});

export function RouteReplayMap({
    dataset,
    currentPointIndex,
    onPointClick,
    followTruck,
    onToggleFollowTruck,
    isFullscreen,
    onToggleFullscreen,
}: RouteReplayMapProps) {
    const { i18n } = useTranslation();
    const isHi = i18n.language === 'hi';
    const currentPoint = dataset.points[currentPointIndex] || dataset.points[0];
    const routeCoords = dataset.points.map((p) => [p.latitude, p.longitude] as [number, number]);

    // Center map on starting position or current position
    const mapCenter: [number, number] = currentPoint
        ? [currentPoint.latitude, currentPoint.longitude]
        : [29.5892, 79.6467];

    return (
        <div
            className={cn(
                'relative bg-white rounded-xl border border-slate-300 overflow-hidden shadow-md flex flex-col transition-all duration-200',
                isFullscreen ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none' : 'h-[520px] lg:h-[700px] w-full'
            )}
        >
            {/* Top Map Header Strip */}
            <div className="bg-navy-950 text-white px-3 sm:px-4 py-2 flex items-center justify-between z-20 border-b border-navy-800">
                <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-100 truncate">
                        {isHi ? 'रूट रीप्ले कंसोल' : 'Route Replay Console'} — {dataset.vehicleNumber} ({dataset.date})
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Follow Truck Toggle */}
                    <button
                        onClick={onToggleFollowTruck}
                        className={cn(
                            'px-2.5 py-1 text-[11px] font-bold rounded flex items-center gap-1.5 transition-colors',
                            followTruck ? 'bg-emerald-600 text-white shadow-xs' : 'bg-navy-800 text-slate-300 hover:text-white'
                        )}
                        title={isHi ? 'कैमरा वाहन पर केंद्रित रखें' : 'Keep map camera centered on truck'}
                    >
                        <Navigation className={cn('w-3.5 h-3.5', followTruck && 'animate-spin')} />
                        <span className="hidden sm:inline">{followTruck ? (isHi ? 'कैमरा लॉक' : 'Camera Locked') : (isHi ? 'स्वतंत्र कैमरा' : 'Free Camera')}</span>
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={onToggleFullscreen}
                        className="px-2.5 py-1 text-[11px] font-bold rounded bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1 shadow-xs transition-colors"
                        title={isFullscreen ? (isHi ? 'फुलस्क्रीन से बाहर निकलें' : 'Exit Fullscreen') : (isHi ? 'फुलस्क्रीन मानचित्र' : 'Fullscreen Map')}
                    >
                        {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{isFullscreen ? (isHi ? 'निकास' : 'Exit') : (isHi ? 'फुलस्क्रीन' : 'Fullscreen')}</span>
                    </button>
                </div>
            </div>

            {/* Main Map */}
            <div className="flex-1 w-full h-full relative z-10">
                <MapContainer center={mapCenter} zoom={14} className="h-full w-full" zoomControl={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Camera recenter helper */}
                    <MapRecenter center={mapCenter} follow={followTruck} />

                    {/* Ward Boundaries Polygons */}
                    {dataset.wardBoundaries.map((ward) => (
                        <Polygon
                            key={ward.id}
                            positions={ward.coordinates}
                            pathOptions={{
                                color: ward.color,
                                fillColor: ward.color,
                                fillOpacity: 0.12,
                                weight: 1.5,
                                dashArray: '4, 4',
                            }}
                        >
                            <Tooltip sticky>
                                <div className="text-xs font-bold font-mono text-navy-900">{ward.wardName}</div>
                            </Tooltip>
                        </Polygon>
                    ))}

                    {/* Master Route Polyline */}
                    {routeCoords.length > 0 && (
                        <Polyline
                            positions={routeCoords}
                            pathOptions={{
                                color: '#1d4ed8', // royal blue
                                weight: 5,
                                opacity: 0.85,
                                lineCap: 'round',
                                lineJoin: 'round',
                            }}
                        />
                    )}

                    {/* Deviation Polyline */}
                    {dataset.deviations.map((dev) => (
                        <Polyline
                            key={dev.id}
                            positions={dev.points}
                            pathOptions={{
                                color: '#ef4444', // red
                                weight: 4,
                                dashArray: '6, 6',
                                opacity: 0.9,
                            }}
                        >
                            <Tooltip>
                                <div className="text-xs font-bold text-red-700">{dev.reason}</div>
                            </Tooltip>
                        </Polyline>
                    ))}

                    {/* Start Location Marker */}
                    {routeCoords.length > 0 && (
                        <Marker position={routeCoords[0]} icon={startIcon}>
                            <Popup>
                                <div className="p-1">
                                    <p className="text-xs font-bold text-emerald-800">🏁 Route Origin Yard</p>
                                    <p className="text-[11px] text-slate-600 font-mono">StartTime: {dataset.startTime}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* End Location Marker */}
                    {routeCoords.length > 0 && (
                        <Marker position={routeCoords[routeCoords.length - 1]} icon={endIcon}>
                            <Popup>
                                <div className="p-1">
                                    <p className="text-xs font-bold text-red-800">🏁 Route Destination Yard</p>
                                    <p className="text-[11px] text-slate-600 font-mono">EndTime: {dataset.endTime}</p>
                                </div>
                            </Popup>
                        </Marker>
                    )}

                    {/* Collection Points Markers */}
                    {dataset.collectionPoints.map((col) => {
                        // Determine if truck has reached or completed this bin by current index
                        const isCompleted = currentPointIndex >= dataset.points.findIndex((p) => p.collectionPointId === col.id) && dataset.points.some((p) => p.collectionPointId === col.id);
                        return (
                            <Marker
                                key={col.id}
                                position={[col.latitude, col.longitude]}
                                icon={collectionPointIcon(isCompleted, col.name)}
                                eventHandlers={{
                                    click: () => {
                                        const matchingPoint = dataset.points.find((p) => p.collectionPointId === col.id);
                                        if (matchingPoint) onPointClick(matchingPoint);
                                    },
                                }}
                            >
                                <Popup>
                                    <div className="p-1 max-w-[200px]">
                                        <div className="flex items-center gap-1 mb-1">
                                            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded text-white', isCompleted ? 'bg-emerald-600' : 'bg-slate-500')}>
                                                {isCompleted ? 'Completed' : 'Scheduled'}
                                            </span>
                                        </div>
                                        <p className="text-xs font-bold text-navy-900">{col.name}</p>
                                        <p className="text-[11px] text-slate-500">{col.wardName}</p>
                                        <p className="text-[10px] font-mono text-emerald-700 mt-1">Scheduled: {col.scheduledTime}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Stop Markers */}
                    {dataset.stops.map((stop) => (
                        <Marker
                            key={stop.id}
                            position={[stop.latitude, stop.longitude]}
                            icon={stopIcon(stop.type, stop.durationMinutes)}
                        >
                            <Popup>
                                <div className="p-1">
                                    <p className="text-xs font-bold text-amber-900">{stop.description}</p>
                                    <p className="text-[11px] text-slate-600 font-mono">
                                        Time: {stop.startTime} - {stop.endTime} ({stop.durationMinutes} min)
                                    </p>
                                    <p className="text-[10px] text-slate-500">{stop.locationName}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Deviation Markers */}
                    {dataset.deviations.map((dev) => (
                        <Marker
                            key={dev.id}
                            position={dev.points[0]}
                            icon={deviationIcon}
                        >
                            <Popup>
                                <div className="p-1">
                                    <p className="text-xs font-bold text-blue-900">{dev.reason}</p>
                                    <p className="text-[11px] text-slate-600 font-mono">Time: {dev.startTime}</p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Animated Garbage Truck Marker */}
                    {currentPoint && (
                        <Marker
                            position={[currentPoint.latitude, currentPoint.longitude]}
                            icon={truckIcon(currentPoint.heading, dataset.vehicleNumber)}
                            eventHandlers={{
                                click: () => onPointClick(currentPoint),
                            }}
                        >
                            <Tooltip permanent direction="top" offset={[0, -22]}>
                                <div className="text-[11px] font-bold font-mono text-navy-900 px-1 py-0.5 bg-white/95 rounded shadow-xs">
                                    🚛 {dataset.vehicleNumber} • {currentPoint.speed} {isHi ? 'किमी/घं' : 'km/h'}
                                </div>
                            </Tooltip>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* Floating Legend / Quick Status Bar overlay */}
            <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-xs border border-slate-300 rounded-lg px-3 py-1.5 shadow-md hidden sm:flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1 text-slate-700">
                    <span className="w-3 h-1 bg-blue-600 rounded-full inline-block" /> {isHi ? 'मुख्य मार्ग' : 'Master Route'}
                </span>
                <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> {isHi ? 'कचरा पात्र संकलित' : 'Bin Cleaned'}
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> {isHi ? 'ठहराव' : 'Stop'}
                </span>
                <span className="flex items-center gap-1 text-red-700">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse inline-block" /> {isHi ? 'अनपेक्षित ठहराव' : 'Unexpected Stop'}
                </span>
            </div>
        </div>
    );
}
