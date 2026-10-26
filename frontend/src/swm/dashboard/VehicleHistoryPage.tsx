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
import {
  History, MapPin, Clock, Route, Truck, Search, Maximize2, Minimize2,
  Play, Pause, RotateCcw, SkipBack, SkipForward, FileSpreadsheet,
  Download, Filter, X, CheckCircle2, ChevronDown, ChevronUp, Calendar, AlertCircle
} from 'lucide-react';
import { format, parseISO, eachDayOfInterval, subDays } from 'date-fns';
import type { Vehicle, HistoryResult, VehicleLocationHistory } from '@/types';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

// Helper component inside MapContainer to handle bounds & auto-follow moving truck
function MapController({
  routeCoords,
  currentPoint,
  followTruck,
  isFullscreen,
}: {
  routeCoords: [number, number][];
  currentPoint: VehicleLocationHistory | null;
  followTruck: boolean;
  isFullscreen: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (routeCoords.length > 0 && !followTruck) {
      const bounds = L.latLngBounds(routeCoords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [routeCoords, map]);

  useEffect(() => {
    if (followTruck && currentPoint) {
      map.panTo([currentPoint.latitude, currentPoint.longitude], { animate: true, duration: 0.5 });
    }
  }, [currentPoint, followTruck, map]);

  useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
      if (routeCoords.length > 0 && !followTruck) {
        map.fitBounds(L.latLngBounds(routeCoords), { padding: [50, 50], maxZoom: 16 });
      }
    }, 250);
    return () => clearTimeout(t);
  }, [isFullscreen, map, routeCoords, followTruck]);

  return null;
}

// Custom map markers
const startIcon = L.divIcon({
  className: 'custom-start-marker',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#10b981;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">S</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const endIcon = L.divIcon({
  className: 'custom-end-marker',
  html: '<div style="width:22px;height:22px;border-radius:50%;background:#ef4444;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:bold;">E</div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Animated Moving Vehicle Marker
const createMovingVehicleMarker = (vehicleNumber: string, speed: number, heading: number) => {
  const isMoving = speed >= 5;
  const badgeColor = isMoving ? '#10b981' : '#f59e0b';

  return L.divIcon({
    className: 'custom-replay-vehicle-marker',
    html: `
      <div style="position:relative; display:flex; flex-direction:column; align-items:center; user-select:none; pointer-events:auto; cursor:pointer;">
        <!-- Vehicle Plate & Live Speed Badge -->
        <div style="background:#0a1628; color:#ffffff; font-family:ui-monospace, monospace; font-size:10px; font-weight:800; padding:2px 7px; border-radius:4px; border:1.5px solid #3b82f6; white-space:nowrap; box-shadow:0 3px 8px rgba(0,0,0,0.4); display:flex; align-items:center; gap:4px; margin-bottom:3px;">
          <span>${vehicleNumber}</span>
          <span style="color:${badgeColor}; font-weight:700;">• ${isMoving ? `${speed.toFixed(0)} km/h` : 'Stopped'}</span>
        </div>
        <!-- Directional Truck / Arrow Icon -->
        <div style="width:34px; height:34px; background:#1e3a8a; border:2.5px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(0,0,0,0.4); transform:rotate(${heading}deg); transition:transform 0.25s linear;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [120, 56],
    iconAnchor: [60, 48],
  });
};

const SPEED_OPTIONS = [0.5, 1, 2, 5, 10];

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

  // ── Route Replay Player State ──
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [followTruck, setFollowTruck] = useState(true);
  const [showLogTable, setShowLogTable] = useState(false);

  // ── Advanced Excel Download Filter Modal State ──
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportTarget, setExportTarget] = useState<'selected' | 'all'>('selected');
  const [exportDateMode, setExportDateMode] = useState<'single' | 'range'>('single');
  const [exportSingleDate, setExportSingleDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [exportStartDate, setExportStartDate] = useState(format(subDays(new Date(), 7), 'yyyy-MM-dd'));
  const [exportEndDate, setExportEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgressText, setExportProgressText] = useState('');

  const selectedVehicleData = vehicles.find((v) => v.id === selectedVehicle);
  const totalPoints = result?.history?.length || 0;
  const currentPoint = totalPoints > 0 && result ? result.history[currentIndex] || result.history[0] : null;

  // ── Replay Timer Interval ──
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying && totalPoints > 0) {
      const intervalMs = Math.max(100, Math.floor(1000 / speedMultiplier));
      timer = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= totalPoints - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, totalPoints, speedMultiplier]);

  // ── Fullscreen Handlers ──
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (mapContainerRef.current && !document.fullscreenElement) {
          if (mapContainerRef.current.requestFullscreen) {
            mapContainerRef.current.requestFullscreen().catch(() => {});
          }
        }
      } catch (e) {}
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
      const list = data.vehicles || [];
      setVehicles(list);
      if (list.length > 0 && !selectedVehicle) {
        setSelectedVehicle(list[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
    } finally {
      setVehiclesLoading(false);
    }
  }

  async function handleViewHistory() {
    if (!selectedVehicle || !selectedDate) return;
    setLoading(true);
    setIsPlaying(false);
    setCurrentIndex(0);
    setResult(null);
    try {
      const data = await historyService.getHistory(selectedVehicle, selectedDate);
      setResult(data);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      toast.error(isHi ? 'इतिहास लोड करने में असमर्थ' : 'Failed to load vehicle history');
    } finally {
      setLoading(false);
    }
  }

  // Auto load when vehicle is picked if vehicles just loaded
  useEffect(() => {
    if (selectedVehicle && selectedDate) {
      handleViewHistory();
    }
  }, [selectedVehicle]);

  // ── Playback Action Controls ──
  const handleTogglePlay = () => {
    if (totalPoints === 0) return;
    if (currentIndex >= totalPoints - 1) {
      setCurrentIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleStepBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setCurrentIndex((prev) => Math.min(totalPoints - 1, prev + 1));
  };

  // ── Coordinates Paths ──
  const fullRouteCoords = result?.history.map((h) => [h.latitude, h.longitude] as [number, number]) || [];
  const traveledRouteCoords = fullRouteCoords.slice(0, currentIndex + 1);

  // ── Helper: Format Place Names / Route descriptions ──
  const getPlaceDescription = (index: number, total: number) => {
    if (index === 0) return isHi ? 'प्रारंभिक डिपो / वाहन स्टेशन' : 'Depot Dispatch Station';
    if (index === total - 1) return isHi ? 'अंतिम ठहराव / संग्रहण केंद्र' : 'Final Disposal Center';
    return isHi ? 'अल्मोड़ा स्वच्छता वार्ड मार्ग' : 'Almora Sanitation Ward Route';
  };

  // ── Master Excel Generator Helper ──
  // Formats data strictly with Truck Name, Date, Starting Place, Ending Place, Total Distance
  const generateAndDownloadExcel = (
    dataRows: Array<{
      truckName: string;
      vehicleNumber: string;
      date: string;
      startPlace: string;
      endPlace: string;
      distance: string;
      duration: string;
      status: string;
    }>,
    reportTitleDesc: string,
    outputFileName: string
  ) => {
    const rows: any[][] = [
      ['🏛️ जिला पंचायत अल्मोड़ा — ठोस अपशिष्ट प्रबंधन एवं सफाई वाहन परिचालन रिपोर्ट'],
      ['ZILA PANCHAYAT ALMORA — SWM FLEET AUDIT & ROUTE START/END LOG'],
      [],
      ['रिपोर्ट विवरण (Report Scope):', reportTitleDesc],
      ['जनरेशन दिनांक व समय (Generated On):', format(new Date(), 'dd/MM/yyyy hh:mm:ss a')],
      ['सत्यापन स्थिति (Verification):', 'Certified Zila Panchayat Almora GPS Telematics System'],
      [],
      // Strictly formatted Table Columns as requested
      [
        'क्र.सं. (S.No.)',
        'ट्रक / वाहन का नाम (Truck Name)',
        'वाहन संख्या (Vehicle Registration No)',
        'दिनांक (Date)',
        'प्रारंभ स्थान व समय (Starting Place & Time)',
        'समाप्ति स्थान व समय (Ending Place & Time)',
        'कुल तय दूरी (Total Distance)',
        'परिचालन समय (Operating Duration)',
        'स्थिति (Status)'
      ]
    ];

    dataRows.forEach((r, idx) => {
      rows.push([
        idx + 1,
        r.truckName,
        r.vehicleNumber,
        r.date,
        r.startPlace,
        r.endPlace,
        r.distance,
        r.duration,
        r.status
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Set neat column widths
    ws['!cols'] = [
      { wch: 8 },  // S.No
      { wch: 22 }, // Truck Name
      { wch: 20 }, // Vehicle Reg No
      { wch: 14 }, // Date
      { wch: 44 }, // Starting Place & Time
      { wch: 44 }, // Ending Place & Time
      { wch: 16 }, // Total Distance
      { wch: 24 }, // Operating Duration
      { wch: 20 }, // Status
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Fleet Route Log');
    XLSX.writeFile(wb, outputFileName);
  };

  // ── Quick 1-Click Excel Download for currently viewed truck and date ──
  const handleQuickDownloadExcel = () => {
    if (!result) {
      toast.error(isHi ? 'डाउनलोड के लिए कोई डेटा नहीं है' : 'No records available to export');
      return;
    }

    const vehicleNumber = selectedVehicleData?.vehicle_number || 'UNKNOWN';
    const vehicleName = selectedVehicleData?.vehicle_name || 'Sanitation Truck';
    const totalCount = result.history.length;

    let startPlace = isHi ? '— कोई संचलन नहीं (डिपो में पार्क) —' : '— No Movement (Parked at Depot) —';
    let endPlace = isHi ? '— कोई संचलन नहीं (डिपो में पार्क) —' : '— No Movement (Parked at Depot) —';
    let duration = 'N/A';
    let status = isHi ? 'स्थिर / अवकाश' : 'Idle / Off-duty';

    if (totalCount > 0) {
      const startPt = result.history[0];
      const endPt = result.history[totalCount - 1];
      const startT = format(new Date(startPt.recorded_at), 'hh:mm a');
      const endT = format(new Date(endPt.recorded_at), 'hh:mm a');
      startPlace = `${startT} — ${getPlaceDescription(0, totalCount)} (${startPt.latitude.toFixed(4)}°N, ${startPt.longitude.toFixed(4)}°E)`;
      endPlace = `${endT} — ${getPlaceDescription(totalCount - 1, totalCount)} (${endPt.latitude.toFixed(4)}°N, ${endPt.longitude.toFixed(4)}°E)`;
      duration = `${startT} – ${endT}`;
      status = isHi ? 'सफलतापूर्वक संपन्न' : 'Completed';
    }

    const row = {
      truckName: vehicleName,
      vehicleNumber,
      date: selectedDate,
      startPlace,
      endPlace,
      distance: `${result.summary.totalDistance} km`,
      duration,
      status
    };

    const fileName = `SWM_Truck_${vehicleNumber}_${selectedDate}.xlsx`;
    generateAndDownloadExcel(
      [row],
      `वाहन: ${vehicleNumber} (${vehicleName}) | दिनांक: ${selectedDate}`,
      fileName
    );

    toast.success(
      isHi
        ? `एक्सेल रिपोर्ट डाउनलोड हो गई: ${fileName}`
        : `Excel audit log downloaded: ${fileName}`
    );
  };

  // ── Filtered Batch Excel Export Handler ──
  const handleExecuteFilterExport = async () => {
    setIsExporting(true);
    setExportProgressText(isHi ? 'डेटा तैयार किया जा रहा है...' : 'Preparing export...');

    try {
      // 1. Determine target vehicles
      const targetVehicles: Vehicle[] = exportTarget === 'selected'
        ? (selectedVehicleData ? [selectedVehicleData] : (vehicles.length > 0 ? [vehicles[0]] : []))
        : vehicles;

      if (targetVehicles.length === 0) {
        toast.error(isHi ? 'कोई वाहन उपलब्ध नहीं है' : 'No vehicles found');
        setIsExporting(false);
        return;
      }

      // 2. Determine target dates
      let targetDates: string[] = [];
      if (exportDateMode === 'single') {
        targetDates = [exportSingleDate];
      } else {
        const start = parseISO(exportStartDate);
        const end = parseISO(exportEndDate);
        if (start > end) {
          toast.error(isHi ? 'प्रारंभ तिथि अंतिम तिथि से पहले होनी चाहिए' : 'Start date must be before end date');
          setIsExporting(false);
          return;
        }
        const days = eachDayOfInterval({ start, end });
        // Max 31 days guard
        if (days.length > 31) {
          toast.error(isHi ? 'अधिकतम 31 दिनों की अवधि चुनी जा सकती है' : 'Please select at most 31 days');
          setIsExporting(false);
          return;
        }
        targetDates = days.map((d) => format(d, 'yyyy-MM-dd'));
      }

      const rowsToExport: Array<{
        truckName: string;
        vehicleNumber: string;
        date: string;
        startPlace: string;
        endPlace: string;
        distance: string;
        duration: string;
        status: string;
      }> = [];

      let totalTasks = targetVehicles.length * targetDates.length;
      let completedTasks = 0;

      // 3. Query records sequentially or in small parallel batches
      for (const veh of targetVehicles) {
        for (const dateStr of targetDates) {
          completedTasks++;
          setExportProgressText(
            isHi
              ? `प्रगति: ${completedTasks}/${totalTasks} — ${veh.vehicle_number} (${dateStr})`
              : `Processing ${completedTasks}/${totalTasks} — ${veh.vehicle_number} (${dateStr})`
          );

          try {
            const histData = await historyService.getHistory(veh.id, dateStr);
            const pts = histData?.history || [];
            const count = pts.length;

            let startPlace = isHi ? '— कोई संचलन नहीं (डिपो में पार्क) —' : '— No Movement (Parked) —';
            let endPlace = isHi ? '— कोई संचलन नहीं (डिपो में पार्क) —' : '— No Movement (Parked) —';
            let duration = 'N/A';
            let status = isHi ? 'स्थिर / अवकाश' : 'Idle / Off-duty';
            let distStr = `${histData?.summary?.totalDistance || 0} km`;

            if (count > 0) {
              const startPt = pts[0];
              const endPt = pts[count - 1];
              const startT = format(new Date(startPt.recorded_at), 'hh:mm a');
              const endT = format(new Date(endPt.recorded_at), 'hh:mm a');
              startPlace = `${startT} — ${getPlaceDescription(0, count)} (${startPt.latitude.toFixed(4)}°N, ${startPt.longitude.toFixed(4)}°E)`;
              endPlace = `${endT} — ${getPlaceDescription(count - 1, count)} (${endPt.latitude.toFixed(4)}°N, ${endPt.longitude.toFixed(4)}°E)`;
              duration = `${startT} – ${endT}`;
              status = isHi ? 'सफलतापूर्वक संपन्न' : 'Completed';
            }

            rowsToExport.push({
              truckName: veh.vehicle_name || 'Sanitation Truck',
              vehicleNumber: veh.vehicle_number,
              date: dateStr,
              startPlace,
              endPlace,
              distance: distStr,
              duration,
              status
            });
          } catch (err) {
            console.warn(`Failed history fetch for ${veh.vehicle_number} on ${dateStr}`);
            rowsToExport.push({
              truckName: veh.vehicle_name || 'Sanitation Truck',
              vehicleNumber: veh.vehicle_number,
              date: dateStr,
              startPlace: isHi ? 'डेटा अनुपलब्ध' : 'Data Unavailable',
              endPlace: isHi ? 'डेटा अनुपलब्ध' : 'Data Unavailable',
              distance: '0 km',
              duration: 'N/A',
              status: isHi ? 'त्रुटि' : 'Error'
            });
          }
        }
      }

      // 4. Generate Final Excel File
      const targetLabel = exportTarget === 'selected'
        ? (selectedVehicleData?.vehicle_number || 'Single_Vehicle')
        : 'All_Vehicles';
      const dateLabel = exportDateMode === 'single'
        ? exportSingleDate
        : `${exportStartDate}_to_${exportEndDate}`;
      const outFileName = `SWM_Fleet_Routes_${targetLabel}_${dateLabel}.xlsx`;

      const scopeDesc = exportTarget === 'selected'
        ? `वाहन: ${selectedVehicleData?.vehicle_number} (${selectedVehicleData?.vehicle_name}) | दिनांक: ${dateLabel}`
        : `समस्त पंजीकृत वाहन बेड़ा (${targetVehicles.length} वाहन) | दिनांक: ${dateLabel}`;

      generateAndDownloadExcel(rowsToExport, scopeDesc, outFileName);

      toast.success(
        isHi
          ? `एक्सेल रिपोर्ट सफलतापूर्वक जनरेट हो गई (${rowsToExport.length} रिकॉर्ड्स)`
          : `Excel export generated successfully (${rowsToExport.length} records)`
      );
      setShowExportModal(false);
    } catch (err) {
      console.error('Export failed:', err);
      toast.error(isHi ? 'एक्सेल जनरेशन में त्रुटि हुई' : 'Failed to generate Excel report');
    } finally {
      setIsExporting(false);
      setExportProgressText('');
    }
  };

  const progressPercent = totalPoints > 0 ? Math.round(((currentIndex + 1) / totalPoints) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-4">

      {/* ── Page Header Strip ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
        <div className="bg-[#0a1628] px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="text-[16px] font-bold text-white uppercase tracking-normal">
                {isHi ? 'वाहन रूट इतिहास एवं रीप्ले प्लेयर' : 'Vehicle Route History & Replay Console'}
              </p>
            </div>
          </div>

          {/* Action Buttons on Header */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick Single Truck Download */}
            <button
              onClick={handleQuickDownloadExcel}
              disabled={!result || totalPoints === 0}
              className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[12px] font-bold px-3.5 py-2 rounded shadow-xs transition-colors shrink-0"
              title={isHi ? 'इस वाहन का आज का डेटा सीधे एक्सेल में लें' : 'Download today\'s route log for current vehicle'}
            >
              <span>{isHi ? 'इस ट्रक का एक्सेल' : 'Download This Truck'}</span>
            </button>

            {/* Filtered Advanced Download Modal Trigger */}
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 bg-[#1a3a6b] hover:bg-[#254f8e] text-white text-[12px] font-bold px-3.5 py-2 rounded shadow-xs transition-colors shrink-0"
              title={isHi ? 'सभी वाहन / दिनांक फ़िल्टर के साथ एक्सेल डाउनलोड विकल्प' : 'Advanced Excel download with vehicle and date filters'}
            >
              <span>{isHi ? 'फ़िल्टर के साथ डाउनलोड करें' : 'Download with Filters'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Controls ── */}
      <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
        <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2 flex items-center justify-between">
          <p className="text-[13px] font-bold text-[#0a1628] uppercase tracking-normal flex items-center gap-2">
            {isHi ? 'वाहन व दिनांक चयन' : 'Select Vehicle & Date for Route Inspection'}
          </p>
        </div>

        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end">
            {/* Vehicle Select */}
            <div className="flex-1 space-y-1.5">
              <Label className="text-[12px] font-bold text-slate-700 uppercase tracking-normal">
                {isHi ? 'वाहन चुनें' : 'Select Vehicle'}
              </Label>
              {vehiclesLoading ? (
                <Skeleton className="h-10 w-full rounded" />
              ) : (
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="flex h-10 w-full border border-slate-300 bg-white px-3 text-xs sm:text-[12px] font-bold text-[#0a1628] focus:border-[#1a3a6b] focus:outline-none rounded"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicle_number} {v.vehicle_name ? `• ${v.vehicle_name}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Date Select */}
            <div className="flex-1 space-y-1.5">
              <Label className="text-[12px] font-bold text-slate-700 uppercase tracking-normal">
                {isHi ? 'दिनांक चुनें' : 'Select Date'}
              </Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                max={format(new Date(), 'yyyy-MM-dd')}
                className="h-10 text-xs sm:text-[12px] font-bold border-slate-300 rounded"
              />
            </div>

            {/* View History Button */}
            <button
              onClick={handleViewHistory}
              disabled={!selectedVehicle || !selectedDate || loading}
              className="flex items-center justify-center gap-2 bg-[#0a1628] hover:bg-[#1a3a6b] disabled:opacity-60 text-white text-xs sm:text-[12px] font-bold uppercase tracking-normal px-6 h-10 rounded transition-colors whitespace-nowrap"
            >
              <Search className="w-4 h-4" />
              {loading ? (isHi ? 'डेटा लोड हो रहा है...' : 'Loading Data...') : (isHi ? 'इतिहास लोड करें' : 'Load History')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      {result && totalPoints > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: isHi ? 'वाहन' : 'Vehicle',
              value: selectedVehicleData?.vehicle_number || '—',
              sub: selectedVehicleData?.vehicle_name || 'Sanitation Fleet'
            },
            {
              label: isHi ? 'परिचालन समय' : 'Operation Hours',
              value: result.summary.startTime
                ? `${format(new Date(result.summary.startTime), 'hh:mm a')} – ${format(new Date(result.summary.endTime!), 'hh:mm a')}`
                : 'N/A',
              sub: `${selectedDate}`
            },
            {
              label: isHi ? 'कुल तय दूरी' : 'Total Distance',
              value: `${result.summary.totalDistance} ${isHi ? 'किमी' : 'km'}`,
              sub: isHi ? 'आज का दैनिक मार्ग' : "Day's Total Run"
            },
            {
              label: isHi ? 'मार्ग कवरेज' : 'Route Coverage',
              value: `${totalPoints} ${isHi ? 'जीपीएस बिंदु' : 'GPS Points'}`,
              sub: isHi ? 'प्रारंभ से अंतिम ठहराव' : 'From Start to End'
            },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-white border border-slate-300 rounded shadow-xs overflow-hidden">
              <div className="bg-[#f0f4f9] border-b border-slate-200 px-3 py-2 flex items-center gap-1.5">
                <p className="text-[11px] sm:text-[12px] font-bold text-slate-700 uppercase tracking-normal leading-normal">{label}</p>
              </div>
              <div className="px-3.5 py-3 flex flex-col justify-center min-h-[68px]">
                <p className={cn(
                  "text-xs sm:text-[14px] font-bold text-[#0a1628] leading-[1.7] py-0.5 truncate",
                  isHi ? "font-sans" : "font-mono"
                )}>
                  {value}
                </p>
                <p className={cn(
                  "text-[11px] text-slate-500 mt-1 leading-[1.6] py-0.5 truncate",
                  isHi ? "font-sans" : "font-mono"
                )}>
                  {sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Map & Replay Player Console ── */}
      {result && totalPoints > 0 ? (
        <div
          ref={mapContainerRef}
          className={cn(
            "bg-white border border-slate-300 rounded overflow-hidden transition-all duration-200 shadow-xs",
            isFullscreen
              ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none flex flex-col bg-slate-900"
              : ""
          )}
        >
          {/* Replay Player Controls Bar */}
          <div className={cn(
            "px-4 py-2.5 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3",
            isFullscreen ? "bg-[#0a1628] text-white border-slate-800" : "bg-[#f8fafc] border-slate-300"
          )}>
            {/* Play/Pause & Stepping */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-1.5 rounded font-bold text-xs uppercase tracking-wide transition-all shadow-xs cursor-pointer",
                  isPlaying
                    ? "bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse"
                    : "bg-[#10b981] hover:bg-emerald-600 text-white"
                )}
                title={isPlaying ? 'Pause Replay' : 'Play Replay'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? (isHi ? 'रोकें' : 'Pause') : (isHi ? 'रीप्ले चलाएं' : 'Play Route')}</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 transition-colors shadow-xs"
                title={isHi ? 'शुरू से पुनः चलाएं' : 'Restart from beginning'}
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleStepBack}
                disabled={currentIndex <= 0}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors shadow-xs"
                title={isHi ? 'एक बिंदु पीछे' : 'Step Back'}
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleStepForward}
                disabled={currentIndex >= totalPoints - 1}
                className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 text-slate-700 transition-colors shadow-xs"
                title={isHi ? 'एक बिंदु आगे' : 'Step Forward'}
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Speed Multiplier Options */}
              <div className="flex items-center border border-slate-300 rounded overflow-hidden ml-1">
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    type="button"
                    onClick={() => setSpeedMultiplier(speed)}
                    className={cn(
                      "px-2 py-1 text-[11px] font-mono font-bold transition-colors",
                      speedMultiplier === speed
                        ? "bg-[#0a1628] text-white"
                        : "bg-white text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    {speed}x
                  </button>
                ))}
              </div>

              {/* Follow Vehicle Toggle */}
              <label className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600 cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={followTruck}
                  onChange={(e) => setFollowTruck(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-3.5 h-3.5"
                />
                <span className={isFullscreen ? "text-slate-300" : "text-slate-700 font-bold"}>
                  {isHi ? 'गाड़ी ट्रैक करें' : 'Follow Truck'}
                </span>
              </label>
            </div>

            {/* Replay Status & Fullscreen Button */}
            <div className="flex items-center gap-3">
              {currentPoint && (
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={cn(
                    "px-2 py-0.5 rounded font-bold border",
                    currentPoint.speed >= 5
                      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                      : "bg-amber-100 text-amber-900 border-amber-300"
                  )}>
                    {currentPoint.speed >= 5 ? `${currentPoint.speed.toFixed(0)} km/h` : (isHi ? 'स्थिर' : 'Stopped')}
                  </span>
                  <span className={isFullscreen ? "text-slate-300" : "text-slate-600"}>
                    {format(new Date(currentPoint.recorded_at), 'hh:mm:ss a')}
                  </span>
                  <span className={isFullscreen ? "text-amber-400 font-bold" : "text-[#1a3a6b] font-bold"}>
                    ({progressPercent}%)
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={toggleFullscreen}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-colors shadow-xs cursor-pointer",
                  isFullscreen
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950"
                    : "bg-[#0a1628] hover:bg-[#1a3a6b] text-white"
                )}
                title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Open in Fullscreen'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5 text-amber-400" />}
                <span className="hidden sm:inline">{isFullscreen ? 'Exit' : (isHi ? 'बड़ी स्क्रीन' : 'Big Screen')}</span>
              </button>
            </div>
          </div>

          {/* Interactive Timeline Scrubbing Bar */}
          <div className={cn(
            "px-4 py-2 border-b flex items-center gap-3",
            isFullscreen ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-[#f1f5f9] border-slate-200 text-slate-600"
          )}>
            <span className="text-[10px] font-mono font-bold shrink-0">
              {result.summary.startTime ? format(new Date(result.summary.startTime), 'hh:mm a') : '00:00'}
            </span>
            <input
              type="range"
              min={0}
              max={Math.max(0, totalPoints - 1)}
              value={currentIndex}
              onChange={(e) => setCurrentIndex(parseInt(e.target.value, 10))}
              className="flex-1 h-2.5 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#1a3a6b]"
            />
            <span className="text-[10px] font-mono font-bold shrink-0">
              {result.summary.endTime ? format(new Date(result.summary.endTime), 'hh:mm a') : '23:59'}
            </span>
          </div>

          {/* Map Display */}
          <div className={cn(
            "relative w-full",
            isFullscreen ? "flex-1 h-full" : "h-[420px] sm:h-[500px] lg:h-[560px]"
          )}>
            <MapContainer
              center={fullRouteCoords[0]}
              zoom={14}
              className="h-full w-full"
              scrollWheelZoom={true}
              attributionControl={false}
            >
              <TileLayer
                attribution='&copy; Google Maps'
                url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              />
              <MapController
                routeCoords={fullRouteCoords}
                currentPoint={currentPoint}
                followTruck={followTruck}
                isFullscreen={isFullscreen}
              />

              {/* Full Route Path (Muted Navy Blue) */}
              <Polyline
                positions={fullRouteCoords}
                pathOptions={{ color: '#1a3a6b', weight: 4, opacity: 0.55 }}
              />

              {/* Active Traveled Route Path (Vibrant Emerald Green) */}
              {traveledRouteCoords.length > 1 && (
                <Polyline
                  positions={traveledRouteCoords}
                  pathOptions={{ color: '#10b981', weight: 5, opacity: 0.95 }}
                />
              )}

              {/* Starting Location Pin */}
              <Marker position={fullRouteCoords[0]} icon={startIcon}>
                <Popup>
                  <div className="font-mono text-xs">
                    <p className="font-bold text-emerald-700">{isHi ? 'प्रारंभ स्थान (Start Point)' : 'Route Starting Point'}</p>
                    <p className="text-slate-600">{getPlaceDescription(0, totalPoints)}</p>
                    <p className="text-slate-500 mt-1">
                      {result.summary.startTime && format(new Date(result.summary.startTime), 'hh:mm:ss a')}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Final Stop Location Pin */}
              <Marker position={fullRouteCoords[totalPoints - 1]} icon={endIcon}>
                <Popup>
                  <div className="font-mono text-xs">
                    <p className="font-bold text-red-700">{isHi ? 'अंतिम ठहराव (End Point)' : 'Route Final Point'}</p>
                    <p className="text-slate-600">{getPlaceDescription(totalPoints - 1, totalPoints)}</p>
                    <p className="text-slate-500 mt-1">
                      {result.summary.endTime && format(new Date(result.summary.endTime), 'hh:mm:ss a')}
                    </p>
                  </div>
                </Popup>
              </Marker>

              {/* Animated Replay Vehicle Marker */}
              {currentPoint && (
                <Marker
                  position={[currentPoint.latitude, currentPoint.longitude]}
                  icon={createMovingVehicleMarker(
                    selectedVehicleData?.vehicle_number || 'TRUCK',
                    currentPoint.speed,
                    currentPoint.heading
                  )}
                >
                  <Popup>
                    <div className="font-mono text-xs p-1">
                      <p className="font-bold text-[#0a1628] border-b pb-1">
                        {selectedVehicleData?.vehicle_number} ({selectedVehicleData?.vehicle_name || 'Truck'})
                      </p>
                      <p className="text-slate-600 mt-1">
                        {isHi ? 'समय' : 'Time'}: {format(new Date(currentPoint.recorded_at), 'hh:mm:ss a')}
                      </p>
                      <p className="text-slate-600">
                        {isHi ? 'गति' : 'Speed'}: <span className="font-bold">{currentPoint.speed.toFixed(1)} km/h</span>
                      </p>
                      <p className="text-slate-500 text-[10px] mt-1">
                        GPS: {currentPoint.latitude.toFixed(5)}, {currentPoint.longitude.toFixed(5)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}
            </MapContainer>
          </div>

          {/* Map Footer Information */}
          <div className={cn(
            "px-4 py-2 border-t flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] font-mono",
            isFullscreen ? "bg-[#0a1628] border-slate-800 text-slate-300" : "bg-[#f8fafc] border-slate-300 text-slate-600"
          )}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                {isHi ? 'प्रारंभ बिंदु' : 'Start'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                {isHi ? 'अंतिम बिंदु' : 'End'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-1.5 bg-[#1a3a6b] rounded-sm inline-block" />
                {isHi ? 'कुल मार्ग' : 'Full Route'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-4 h-1.5 bg-[#10b981] rounded-sm inline-block" />
                {isHi ? 'चला हुआ मार्ग' : 'Traveled'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogTable(!showLogTable)}
                className="text-xs font-bold text-[#1a3a6b] hover:underline flex items-center gap-1 cursor-pointer"
              >
                {showLogTable ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showLogTable
                  ? (isHi ? 'लॉग तालिका छिपाएं' : 'Hide Log Table')
                  : (isHi ? `जीपीएस लॉग तालिका देखें (${totalPoints})` : `View GPS Table (${totalPoints})`)}
              </button>
            </div>
          </div>
        </div>
      ) : result && totalPoints === 0 ? (
        <EmptyState
          icon={History}
          title={isHi ? 'इस दिनांक के लिए कोई जीपीएस रिकॉर्ड नहीं मिला' : 'No GPS Records Found'}
          description={
            isHi
              ? `${selectedVehicleData?.vehicle_number || 'वाहन'} के लिए ${selectedDate} पर कोई जीपीएस टेलीमैटिक्स डेटा दर्ज नहीं हुआ है। कृपया कोई अन्य तिथि या वाहन चुनें।`
              : `No GPS history recorded for ${selectedVehicleData?.vehicle_number} on ${selectedDate}. Please select another date or vehicle.`
          }
        />
      ) : null}

      {/* ── Collapsible Checkpoint Records Table ── */}
      {result && totalPoints > 0 && showLogTable && (
        <div className="bg-white border border-slate-300 rounded overflow-hidden shadow-xs">
          <div className="bg-[#f0f4f9] border-b border-slate-300 px-4 py-2.5 flex items-center justify-between">
            <p className="text-[13px] font-bold text-[#0a1628] uppercase tracking-normal">
              {isHi ? 'दैनिक जीपीएस चेकपॉइंट ऑडिट लॉग' : 'Daily GPS Checkpoints Audit Table'} — {selectedVehicleData?.vehicle_number} ({selectedDate})
            </p>
            <button
              onClick={handleQuickDownloadExcel}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              {isHi ? 'एक्सेल में लें' : 'Export Table to Excel'}
            </button>
          </div>

          <div className="max-h-72 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 text-[11px] text-slate-700">
                <tr>
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">{isHi ? 'समय' : 'Time'}</th>
                  <th className="py-2 px-3">{isHi ? 'स्थान / विवरण' : 'Place / Route Area'}</th>
                  <th className="py-2 px-3">{isHi ? 'अक्षांश' : 'Latitude'}</th>
                  <th className="py-2 px-3">{isHi ? 'देशांतर' : 'Longitude'}</th>
                  <th className="py-2 px-3">{isHi ? 'गति (km/h)' : 'Speed'}</th>
                  <th className="py-2 px-3">{isHi ? 'स्थिति' : 'Status'}</th>
                  <th className="py-2 px-3">{isHi ? 'कार्रवाई' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.history.map((pt, i) => (
                  <tr
                    key={pt.id || i}
                    onClick={() => setCurrentIndex(i)}
                    className={cn(
                      "hover:bg-blue-50/60 cursor-pointer transition-colors",
                      currentIndex === i ? "bg-amber-100/70 font-bold" : ""
                    )}
                  >
                    <td className="py-1.5 px-3">{i + 1}</td>
                    <td className="py-1.5 px-3 text-[#1a3a6b]">
                      {format(new Date(pt.recorded_at), 'hh:mm:ss a')}
                    </td>
                    <td className="py-1.5 px-3 text-slate-700">
                      {getPlaceDescription(i, totalPoints)}
                    </td>
                    <td className="py-1.5 px-3 text-slate-500">{pt.latitude.toFixed(5)}</td>
                    <td className="py-1.5 px-3 text-slate-500">{pt.longitude.toFixed(5)}</td>
                    <td className="py-1.5 px-3 font-bold">{pt.speed.toFixed(0)}</td>
                    <td className="py-1.5 px-3">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded text-[10px]",
                        pt.speed >= 5 ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                      )}>
                        {pt.speed >= 5 ? (isHi ? 'गतिमान' : 'Moving') : (isHi ? 'स्थिर' : 'Stopped')}
                      </span>
                    </td>
                    <td className="py-1.5 px-3 text-blue-700 text-[11px]">
                      {currentIndex === i ? '● Active' : 'Jump'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Initial empty state */}
      {!result && !loading && (
        <div className="bg-white border border-slate-300 rounded p-10 text-center shadow-xs">
          <History className="w-9 h-9 text-slate-300 mx-auto mb-3" />
          <p className="text-[13px] font-bold text-slate-600 uppercase tracking-normal">
            {isHi ? 'वाहन और दिनांक चुनें' : 'Select a Vehicle and Date'}
          </p>
          <p className="text-[11px] text-slate-400 font-mono mt-1">
            {isHi
              ? 'ऊपर वाहन और तारीख चुनकर इतिहास लोड करें, फिर रूट रीप्ले और एक्सेल डाउनलोड का उपयोग करें।'
              : 'Choose a vehicle and date above to load route history, play route replay, and export Excel logs.'}
          </p>
        </div>
      )}

      {/* ── Advanced Excel Download Filter Modal ── */}
      {showExportModal && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white rounded-lg border border-slate-300 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0a1628] px-4 py-3 flex items-center justify-between text-white border-b border-navy-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-normal">
                    {isHi ? 'वाहन परिचालन एक्सेल रिपोर्ट डाउनलोड' : 'Export Vehicle Route Excel Report'}
                  </h3>
                  <p className="text-[10px] text-slate-300 font-mono">
                    {isHi
                      ? 'ट्रक का नाम, दिनांक, प्रारंभिक व अंतिम स्थान सारांश'
                      : 'Truck Name, Date, Starting & Ending Place Summary'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setShowExportModal(false)}
                className="p-1 text-slate-300 hover:text-white rounded hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 text-xs font-mono">
              {/* Filter 1: Target Vehicle */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  1. {isHi ? 'वाहन फ़िल्टर (Select Vehicle Scope)' : '1. Vehicle Scope'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={cn(
                    "flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all",
                    exportTarget === 'selected'
                      ? "border-[#1a3a6b] bg-blue-50/70 text-[#0a1628] font-bold shadow-xs"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  )}>
                    <input
                      type="radio"
                      name="exportTarget"
                      value="selected"
                      checked={exportTarget === 'selected'}
                      onChange={() => setExportTarget('selected')}
                      className="text-[#1a3a6b] focus:ring-0"
                    />
                    <div className="truncate">
                      <p className="text-[11px] truncate">
                        {isHi ? 'केवल चयनित वाहन' : 'Selected Vehicle'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal truncate">
                        {selectedVehicleData?.vehicle_number || 'Single Truck'}
                      </p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all",
                    exportTarget === 'all'
                      ? "border-[#1a3a6b] bg-blue-50/70 text-[#0a1628] font-bold shadow-xs"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  )}>
                    <input
                      type="radio"
                      name="exportTarget"
                      value="all"
                      checked={exportTarget === 'all'}
                      onChange={() => setExportTarget('all')}
                      className="text-[#1a3a6b] focus:ring-0"
                    />
                    <div className="truncate">
                      <p className="text-[11px] truncate">
                        {isHi ? 'सभी वाहन बेड़ा' : 'All Fleet Trucks'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-normal truncate">
                        {vehicles.length} {isHi ? 'पंजीकृत वाहन' : 'Registered Trucks'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Filter 2: Date Selection Mode */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  2. {isHi ? 'दिनांक फ़िल्टर (Select Date Filter)' : '2. Date Mode'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <label className={cn(
                    "flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all",
                    exportDateMode === 'single'
                      ? "border-[#1a3a6b] bg-blue-50/70 text-[#0a1628] font-bold shadow-xs"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  )}>
                    <input
                      type="radio"
                      name="exportDateMode"
                      value="single"
                      checked={exportDateMode === 'single'}
                      onChange={() => setExportDateMode('single')}
                      className="text-[#1a3a6b] focus:ring-0"
                    />
                    <div>
                      <p className="text-[11px]">{isHi ? 'एकल तिथि' : 'Single Date'}</p>
                      <p className="text-[10px] text-slate-500 font-normal">{isHi ? 'एक दिन का डेटा' : '1 Day Only'}</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all",
                    exportDateMode === 'range'
                      ? "border-[#1a3a6b] bg-blue-50/70 text-[#0a1628] font-bold shadow-xs"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                  )}>
                    <input
                      type="radio"
                      name="exportDateMode"
                      value="range"
                      checked={exportDateMode === 'range'}
                      onChange={() => setExportDateMode('range')}
                      className="text-[#1a3a6b] focus:ring-0"
                    />
                    <div>
                      <p className="text-[11px]">{isHi ? 'तिथि सीमा (Date Range)' : 'Date Range'}</p>
                      <p className="text-[10px] text-slate-500 font-normal">{isHi ? 'यहाँ से यहाँ तक' : 'From - To'}</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Date Inputs depending on Mode */}
              {exportDateMode === 'single' ? (
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-600 block">
                    {isHi ? 'दिनांक चुनें:' : 'Select Date:'}
                  </label>
                  <Input
                    type="date"
                    value={exportSingleDate}
                    onChange={(e) => setExportSingleDate(e.target.value)}
                    max={format(new Date(), 'yyyy-MM-dd')}
                    className="h-9 text-xs font-mono font-bold"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 block">
                      {isHi ? 'प्रारंभ तिथि (From Date):' : 'From Date:'}
                    </label>
                    <Input
                      type="date"
                      value={exportStartDate}
                      onChange={(e) => setExportStartDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-600 block">
                      {isHi ? 'अंतिम तिथि (To Date):' : 'To Date:'}
                    </label>
                    <Input
                      type="date"
                      value={exportEndDate}
                      onChange={(e) => setExportEndDate(e.target.value)}
                      max={format(new Date(), 'yyyy-MM-dd')}
                      className="h-9 text-xs font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              {/* Included Columns Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded p-2.5 text-[11px] text-slate-600 space-y-1">
                <p className="font-bold text-[#0a1628] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isHi ? 'एक्सेल फाइल में शामिल मुख्य कॉलम:' : 'Excel Columns Included:'}
                </p>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-600 font-mono pl-5">
                  <span>• ट्रक का नाम (Truck Name)</span>
                  <span>• वाहन संख्या (Vehicle No)</span>
                  <span>• परिचालन दिनांक (Date)</span>
                  <span>• प्रारंभ स्थान व समय</span>
                  <span>• समाप्ति स्थान व समय</span>
                  <span>• कुल तय दूरी (km)</span>
                  <span>• परिचालन अवधि</span>
                  <span>• परिचालन स्थिति</span>
                </div>
              </div>

              {/* Progress Text while downloading */}
              {isExporting && (
                <div className="bg-amber-50 border border-amber-300 p-2.5 rounded text-amber-900 text-xs flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-amber-600 border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="font-bold">{exportProgressText}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f0f4f9] px-4 py-3 border-t border-slate-300 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-slate-300 rounded text-slate-700 bg-white hover:bg-slate-100 font-bold text-xs"
              >
                {isHi ? 'रद्द करें' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={isExporting}
                onClick={handleExecuteFilterExport}
                className="flex items-center gap-1.5 px-5 py-2 rounded bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isExporting
                    ? (isHi ? 'डाउनलोड हो रहा है...' : 'Exporting...')
                    : (isHi ? 'एक्सेल (.xlsx) डाउनलोड करें' : 'Download Excel (.xlsx)')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
