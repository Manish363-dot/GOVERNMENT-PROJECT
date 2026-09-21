import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import {
  Truck, MapPin, Radio, MessageSquareWarning, ShieldCheck,
  CheckCircle2, Activity, ArrowRight, Layers, Building2, AlertCircle
} from 'lucide-react';
import { vehicleService } from '@/services/vehicle.service';
import { trackingService } from '@/services/tracking.service';
import { complaintService } from '@/services/complaint.service';
import type { DashboardStats } from '@/types';
import { format } from 'date-fns';
import { GpsDevicesPage } from './GpsDevicesPage';
import { useTranslation } from 'react-i18next';

export function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    liveVehicles: 0,
    onlineDevices: 0,
    newComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const currentDateStr = format(new Date(), 'dd MMMM yyyy');
  const currentTimeStr = format(new Date(), 'HH:mm');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const [vehiclesRes, trackingRes, complaintsRes] = await Promise.allSettled([
        vehicleService.getAll(),
        trackingService.getStats(),
        complaintService.getCounts(),
      ]);

      setStats({
        totalVehicles: vehiclesRes.status === 'fulfilled' ? vehiclesRes.value.vehicles.length : 0,
        liveVehicles: trackingRes.status === 'fulfilled' ? trackingRes.value.liveVehicles : 0,
        onlineDevices: trackingRes.status === 'fulfilled' ? trackingRes.value.onlineDevices : 0,
        newComplaints: complaintsRes.status === 'fulfilled' ? complaintsRes.value.counts.new : 0,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Page Header Banner ── */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
        {/* Top navy strip */}
        <div className="bg-navy-900 border-b border-navy-800 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-[16px] font-bold text-white uppercase tracking-wide">
                {t('admin.dashboard.title')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-1.5 h-5 bg-navy-800 rounded-full" />
        <p className="text-xs font-bold text-navy-900 uppercase tracking-widest font-mono">{t('admin.dashboard.metrics')}</p>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('admin.dashboard.totalVehicles')}
          subtitle={t('admin.dashboard.totalVehiclesSub')}
          value={stats.totalVehicles}
          icon={Truck}
          loading={loading}
        />
        <KPICard
          title={t('admin.dashboard.liveGps')}
          subtitle={t('admin.dashboard.liveGpsSub')}
          value={stats.liveVehicles}
          icon={MapPin}
          loading={loading}
        />
        <KPICard
          title={t('admin.dashboard.onlineDevices')}
          subtitle={t('admin.dashboard.onlineDevicesSub')}
          value={stats.onlineDevices}
          icon={Radio}
          loading={loading}
        />
        <KPICard
          title={t('admin.dashboard.pendingComplaints')}
          subtitle={t('admin.dashboard.pendingComplaintsSub')}
          value={stats.newComplaints}
          icon={MessageSquareWarning}
          loading={loading}
        />
      </div>

      {/* ── Device Management Section ── */}
      <div className="pt-2">
        <GpsDevicesPage />
      </div>
    </div>
  );
}
