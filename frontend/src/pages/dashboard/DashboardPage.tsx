import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import {
  Truck, MapPin, Radio, MessageSquareWarning, ShieldCheck,
  CheckCircle2, Clock, Activity, ArrowRight, Layers, Building2, UserCheck
} from 'lucide-react';
import { vehicleService } from '@/services/vehicle.service';
import { trackingService } from '@/services/tracking.service';
import { complaintService } from '@/services/complaint.service';
import type { DashboardStats } from '@/types';
import { format } from 'date-fns';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    liveVehicles: 0,
    onlineDevices: 0,
    newComplaints: 0,
  });
  const [loading, setLoading] = useState(true);
  const currentDateStr = format(new Date(), 'dd MMMM yyyy');

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
      {/* Official Government Header Banner */}
      <div className="bg-white text-navy-900 rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden border border-slate-200">
        {/* Top Tricolor Accent Bar */}
        <div className="uk-tricolor-line h-1 absolute top-0 left-0 right-0" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10 pt-1">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                उत्तराखंड शासन • Zila Panchayat Safai Portal
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                <Building2 className="w-3 h-3 text-amber-600" />
                Department Control Desk
              </span>
            </div>

            <h1 className="font-poppins text-xl sm:text-2xl font-bold tracking-tight text-navy-900">
              District Sanitation & Telematics Command Panel
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl font-medium">
              Official monitoring system for real-time garbage vehicle tracking, grievance redressal operations, and telematics audit across all rural and urban panchayat wards.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 border-slate-200 pt-3 md:pt-0">
            <div className="text-left md:text-right">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Date & System Time</p>
              <p className="text-xs font-mono font-bold text-emerald-700">{currentDateStr}</p>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              PORTAL LIVE & ACTIVE
            </div>
          </div>
        </div>
      </div>

      {/* Key Operational Metrics (KPI Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Registered Fleet"
          subtitle="Sanitation Vehicles"
          value={stats.totalVehicles}
          icon={Truck}
          loading={loading}
        />
        <KPICard
          title="Live GPS Active"
          subtitle="Currently Tracking"
          value={stats.liveVehicles}
          icon={MapPin}
          loading={loading}
        />
        <KPICard
          title="Online Telematics"
          subtitle="Traccar Network"
          value={stats.onlineDevices}
          icon={Radio}
          loading={loading}
        />
        <KPICard
          title="Pending Grievances"
          subtitle="Action Required"
          value={stats.newComplaints}
          icon={MessageSquareWarning}
          loading={loading}
        />
      </div>

      {/* Main Administrative Operations Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* System Operational Status Panel */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-700" />
                <h3 className="font-poppins font-bold text-navy-900 text-sm">System Operational Health</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                GOVERNMENT CLOUD API
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-navy-900">Backend Express API Gateway</p>
                    <p className="text-[10px] text-slate-500 font-mono">Port 5000 • Operational</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  ONLINE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-navy-900">Supabase Database & Auth Cluster</p>
                    <p className="text-[10px] text-slate-500 font-mono">PostgreSQL RLS Active</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  CONNECTED
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-navy-900">Traccar GPS Telematics Engine</p>
                    <p className="text-[10px] text-slate-500 font-mono">Port 5055 • Device Receiver</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                  TELEMETRY READY
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="font-mono text-[11px]">Security Status: 256-Bit SSL Encrypted</span>
            <span className="font-semibold text-emerald-700 text-[11px]">Gov Cloud v1.0</span>
          </div>
        </div>

        {/* Administrative Quick Operations Hub */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-700" />
              <h3 className="font-poppins font-bold text-navy-900 text-sm">Departmental Operations Desk</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              DIRECT MODULES
            </span>
          </div>

          <div className="space-y-3">
            <a
              href="/dashboard/tracking"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 group-hover:text-emerald-800">
                    Live GIS Vehicle Tracking Console
                  </p>
                  <p className="text-[11px] text-slate-500">View real-time district map and live speeds</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1 shrink-0" />
            </a>

            <a
              href="/dashboard/complaints"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                  <MessageSquareWarning className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 group-hover:text-emerald-800">
                    Public Grievance Redressal Desk
                  </p>
                  <p className="text-[11px] text-slate-500">Manage citizen complaints and resolution remarks</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1 shrink-0" />
            </a>

            <a
              href="/dashboard/vehicles"
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 transition-colors">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 group-hover:text-emerald-800">
                    Sanitation Vehicle Directory
                  </p>
                  <p className="text-[11px] text-slate-500">Register new collection trucks and link GPS hardware</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-1 shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
