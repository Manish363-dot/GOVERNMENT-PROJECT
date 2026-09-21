import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { vehicleService } from '@/services/vehicle.service';
import { routeReplayService } from '@/services/routeReplayService';
import type { Vehicle } from '@/types';
import type { RouteReplayDataset, ReplayPoint, ReplayEvent } from '@/types/routeReplay';

import { RouteReplayMap } from '@/components/routeReplay/RouteReplayMap';
import { PlaybackControls } from '@/components/routeReplay/PlaybackControls';
import { TimelineSlider } from '@/components/routeReplay/TimelineSlider';
import { PointDetailsModal } from '@/components/routeReplay/PointDetailsModal';
import { RoutePerformanceSummary } from '@/components/routeReplay/RoutePerformanceSummary';
import { EventsTimeline } from '@/components/routeReplay/EventsTimeline';
import { MapLegendGuide } from '@/components/MapLegendGuide';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { PlaySquare, ShieldCheck, Search, Info, RotateCcw, Truck } from 'lucide-react';
import { format } from 'date-fns';

export function RouteReplayPage() {
    const { t, i18n } = useTranslation();
    const isHi = i18n.language === 'hi';
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState('');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [startTime, setStartTime] = useState('06:00');
    const [endTime, setEndTime] = useState('12:00');

    const [dataset, setDataset] = useState<RouteReplayDataset | null>(null);
    const [loading, setLoading] = useState(false);
    const [vehiclesLoading, setVehiclesLoading] = useState(true);

    // Playback state
    const [currentPointIndex, setCurrentPointIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speedMultiplier, setSpeedMultiplier] = useState(1);
    const [followTruck, setFollowTruck] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Modal inspection state
    const [inspectedPoint, setInspectedPoint] = useState<ReplayPoint | null>(null);

    const TEST_VEHICLE: Vehicle = {
        id: 'v-test-demo',
        vehicle_number: 'UK-01-TEST-01',
        vehicle_name: 'Testing Demo Vehicle (Safai Truck)',
        vehicle_type: 'truck',
        status: 'moving',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    // Initial fetch of vehicles list
    useEffect(() => {
        async function loadVehicles() {
            try {
                const data = await vehicleService.getAll();
                const list = [TEST_VEHICLE, ...(data.vehicles || [])];
                setVehicles(list);
                setSelectedVehicleId(TEST_VEHICLE.id);
            } catch (err) {
                console.error('Failed to load vehicles:', err);
                setVehicles([TEST_VEHICLE]);
                setSelectedVehicleId(TEST_VEHICLE.id);
            } finally {
                setVehiclesLoading(false);
            }
        }
        loadVehicles();
    }, []);

    // Fetch replay dataset when vehicles load
    useEffect(() => {
        if (selectedVehicleId) {
            handleLoadReplay();
        }
    }, [selectedVehicleId]);

    // Playback timer interval
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (isPlaying && dataset && dataset.points.length > 0) {
            const intervalMs = Math.max(100, Math.floor(1000 / speedMultiplier));

            timer = setInterval(() => {
                setCurrentPointIndex((prev) => {
                    if (prev >= dataset.points.length - 1) {
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
    }, [isPlaying, speedMultiplier, dataset]);

    async function handleLoadReplay() {
        if (!selectedVehicleId) return;
        setLoading(true);
        setIsPlaying(false);
        setCurrentPointIndex(0);

        const vehicleInfo = vehicles.find((v) => v.id === selectedVehicleId);

        try {
            const data = await routeReplayService.getReplayDataset(
                selectedVehicleId,
                selectedDate,
                startTime,
                endTime,
                vehicleInfo
            );
            setDataset(data);
        } catch (err) {
            console.error('Failed to load replay dataset:', err);
        } finally {
            setLoading(false);
        }
    }

    // Playback action handlers
    const handleTogglePlay = () => {
        if (!dataset || dataset.points.length === 0) return;
        if (currentPointIndex >= dataset.points.length - 1) {
            setCurrentPointIndex(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleRestart = () => {
        setIsPlaying(false);
        setCurrentPointIndex(0);
    };

    const handleSeekIndex = (index: number) => {
        setCurrentPointIndex(index);
    };

    const handleStepBack = () => {
        setCurrentPointIndex((prev) => Math.max(0, prev - 1));
    };

    const handleStepForward = () => {
        if (!dataset) return;
        setCurrentPointIndex((prev) => Math.min(dataset.points.length - 1, prev + 1));
    };

    const handleSelectEvent = (ev: ReplayEvent) => {
        setCurrentPointIndex(ev.pointIndex);
        if (dataset && dataset.points[ev.pointIndex]) {
            setInspectedPoint(dataset.points[ev.pointIndex]);
        }
    };

    const currentPoint = dataset?.points[currentPointIndex];

    return (
        <div className="animate-fade-in space-y-4">
            {/* Official Government Page Header */}
            <div className="bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
                <div className="bg-navy-950 px-4 py-3 flex items-center justify-between border-b border-navy-800">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                            <PlaySquare className="w-4 h-4" />
                        </div>
                        <div>
                            <h1 className="font-poppins text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                                {t('admin.replay.title')}
                            </h1>
                            <p className="text-[11px] text-slate-300 font-mono">
                                {isHi ? 'उत्तराखंड जिला पंचायत • ऐतिहासिक यात्रा पथ एवं ऑडिट प्लेबैक' : 'Uttarakhand Zila Panchayat • Historical Trajectory & Audit Playback'}
                            </p>
                        </div>
                    </div>
                    <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800 uppercase font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {isHi ? 'सत्यापित जीआईएस ऑडिट' : 'Verified GIS Audit'}
                    </span>
                </div>

                {/* Search & Selection Controls Panel */}
                <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end font-mono">
                        {/* Vehicle Selector */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.replay.selectVehicle')} *</Label>
                            {vehiclesLoading ? (
                                <Skeleton className="h-10 w-full rounded" />
                            ) : (
                                <select
                                    value={selectedVehicleId}
                                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                                    className="flex h-10 w-full rounded border border-slate-300 bg-white px-3 text-xs font-bold text-navy-900 focus:border-navy-900 focus:outline-none"
                                >
                                    {vehicles.map((v) => (
                                        <option key={v.id} value={v.id}>
                                            {v.vehicle_number} {v.vehicle_name ? `(${v.vehicle_name})` : ''}
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Date Selector */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.replay.selectDate')} *</Label>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                max={format(new Date(), 'yyyy-MM-dd')}
                                className="h-10 text-xs font-bold border-slate-300 rounded"
                            />
                        </div>

                        {/* Start Time */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.replay.startTime')}</Label>
                            <Input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="h-10 text-xs font-bold border-slate-300 rounded"
                            />
                        </div>

                        {/* End Time */}
                        <div className="space-y-1">
                            <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{t('admin.replay.endTime')}</Label>
                            <Input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="h-10 text-xs font-bold border-slate-300 rounded"
                            />
                        </div>

                        {/* Load Replay Button */}
                        <div>
                            <button
                                onClick={handleLoadReplay}
                                disabled={!selectedVehicleId || loading}
                                className="w-full h-10 bg-navy-900 hover:bg-navy-800 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors flex items-center justify-center gap-2 shadow-xs touch-target"
                            >
                                <Search className="w-4 h-4 text-amber-400" />
                                {loading ? (isHi ? 'लोड हो रहा है...' : 'Fetching...') : t('admin.replay.loadRoute')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Demo Data Notice Banner */}
            {dataset?.isDemoData && (
                <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-xs font-mono text-xs">
                    <Info className="w-5 h-5 text-amber-700 shrink-0" />
                    <div className="flex-1">
                        <span className="font-bold uppercase tracking-wider text-amber-950 block">
                            {isHi ? 'सिमुलेशन डेमो परत सक्रिय' : 'Simulation Demo Layer Active'}
                        </span>
                        <span className="text-[11px] text-amber-800">
                            {isHi ? 'इस समयावधि के लिए कोई लाइव हार्डवेयर डेटा नहीं मिला। परीक्षण हेतु यथार्थवादी जिला अपशिष्ट संग्रहण रूट प्रदर्शित किया जा रहा है।' : 'No live hardware transmissions logged for this timeframe. Displaying realistic district waste collection route dataset for testing & evaluation.'}
                        </span>
                    </div>
                </div>
            )}

            {/* Main Console Split Grid Layout */}
            {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-5 space-y-4">
                        <Skeleton className="h-20 w-full rounded-xl" />
                        <Skeleton className="h-16 w-full rounded-xl" />
                        <Skeleton className="h-32 w-full rounded-xl" />
                        <Skeleton className="h-48 w-full rounded-xl" />
                    </div>
                    <div className="lg:col-span-7">
                        <Skeleton className="h-[650px] w-full rounded-xl" />
                    </div>
                </div>
            ) : dataset && dataset.points.length === 0 ? (
                <div className="bg-amber-50/90 border border-amber-300 text-amber-950 p-6 rounded-xl flex items-start gap-4 font-mono shadow-xs max-w-3xl mx-auto my-4">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 border border-amber-400/30">
                        <Truck className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-amber-950 uppercase tracking-wide">
                            No Recorded Telemetry Data for {dataset.vehicleNumber}
                        </h3>
                        <p className="text-xs text-amber-900 leading-relaxed">
                            Vehicle <span className="font-bold text-amber-950">{dataset.vehicleNumber} {dataset.vehicleName ? `(${dataset.vehicleName})` : ''}</span> has 0 recorded GPS track points in the production database for <span className="font-bold">{selectedDate}</span> between <span className="font-bold">{startTime} - {endTime}</span>.
                        </p>
                    </div>
                </div>
            ) : dataset ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                    {/* LEFT PANEL: Playback Controls, Timeline, Audit Summary & Events */}
                    <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
                        {/* Playback Controls */}
                        <PlaybackControls
                            isPlaying={isPlaying}
                            onTogglePlay={handleTogglePlay}
                            onRestart={handleRestart}
                            speedMultiplier={speedMultiplier}
                            onChangeSpeed={(spd) => setSpeedMultiplier(spd)}
                            currentTimeStr={currentPoint?.timeStr || dataset.startTime}
                            currentIndex={currentPointIndex}
                            totalPoints={dataset.points.length}
                            onStepBack={handleStepBack}
                            onStepForward={handleStepForward}
                        />

                        {/* Interactive Timeline Slider */}
                        <TimelineSlider
                            dataset={dataset}
                            currentIndex={currentPointIndex}
                            onSeekIndex={handleSeekIndex}
                        />

                        {/* Route Performance Metrics Summary */}
                        <RoutePerformanceSummary performance={dataset.performance} />

                        {/* Telematics Chronological Events Timeline */}
                        <EventsTimeline
                            events={dataset.events}
                            onSelectEvent={handleSelectEvent}
                            activePointIndex={currentPointIndex}
                        />
                    </div>

                    {/* RIGHT PANEL: Interactive High-Fidelity Route Replay Map */}
                    <div className="lg:col-span-7 order-1 lg:order-2 sticky top-4">
                        <RouteReplayMap
                            dataset={dataset}
                            currentPointIndex={currentPointIndex}
                            onPointClick={(pt) => setInspectedPoint(pt)}
                            followTruck={followTruck}
                            onToggleFollowTruck={() => setFollowTruck(!followTruck)}
                            isFullscreen={isFullscreen}
                            onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                        />
                    </div>

                    {/* Point Inspection Modal */}
                    <PointDetailsModal
                        point={inspectedPoint}
                        onClose={() => setInspectedPoint(null)}
                    />
                </div>
            ) : null}
        </div>
    );
}
