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

export function DashboardPage() {
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
              <p className="text-sm font-bold text-white uppercase tracking-wide">
                District Sanitation &amp; Telematics Command Panel
              </p>
              <p className="text-[11px] text-slate-300 font-mono mt-0.5">
                उत्तराखंड शासन | जिला पंचायत सफाई पोर्टल | Zila Panchayat Safai Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 bg-emerald-900/40 border border-emerald-700/50 px-2.5 py-1 rounded">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase">PORTAL LIVE</span>
            </div>
          </div>
        </div>

        {/* Info bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-2 flex flex-wrap gap-x-6 gap-y-2 text-[11px] font-mono text-slate-600">
          <span><span className="font-bold text-slate-800">Date:</span> {currentDateStr}</span>
          <span><span className="font-bold text-slate-800">Time:</span> {currentTimeStr} IST</span>
          <span><span className="font-bold text-slate-800">Department:</span> Zila Panchayat, Sanitation Wing</span>
          <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /><span className="font-bold text-slate-800">State:</span> Uttarakhand</span>
        </div>
      </div>

      {/* ── Section Label ── */}
      <div className="flex items-center gap-3 pt-2">
        <div className="w-1.5 h-5 bg-navy-800 rounded-full" />
        <p className="text-xs font-bold text-navy-900 uppercase tracking-widest font-mono">Key Operational Metrics</p>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── KPI Cards ── */}
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

      {/* ── Section Label ── */}
      <div className="flex items-center gap-3 pt-4">
        <div className="w-1.5 h-5 bg-navy-800 rounded-full" />
        <p className="text-xs font-bold text-navy-900 uppercase tracking-widest font-mono">Administrative Operations</p>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* ── Admin Grid ── */}
      <div className="grid lg:grid-cols-2 gap-5 pb-4">

        {/* System Operational Status */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Activity className="w-4 h-4 text-navy-800" />
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">System Operational Health</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-300 px-2 py-0.5 rounded-sm">
              GOVERNMENT CLOUD API
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Row 1 */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-navy-900">Backend Express API Gateway</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Port 5000 • Operational</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
                ONLINE
              </span>
            </div>

            {/* Row 2 */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-navy-900">Supabase Database &amp; Auth Cluster</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">PostgreSQL RLS Active</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
                CONNECTED
              </span>
            </div>

            {/* Row 3 */}
            <div className="px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse shrink-0" />
                <div>
                  <p className="text-xs font-bold text-navy-900">Traccar GPS Telematics Engine</p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">Port 5055 • Device Receiver</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-sm">
                TELEMETRY READY
              </span>
            </div>
          </div>

          <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">Security: 256-Bit SSL Encrypted</span>
            <span className="text-[11px] font-mono font-bold text-navy-900">Gov Cloud v1.0</span>
          </div>
        </div>

        {/* Departmental Quick Access */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md overflow-hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-navy-800" />
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider">Departmental Operations Desk</h3>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 bg-white border border-slate-300 px-2 py-0.5 rounded-sm">
              DIRECT MODULES
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            <a
              href="/dashboard/tracking"
              className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-sm bg-navy-50 border border-navy-100 flex items-center justify-center shrink-0 group-hover:bg-navy-800 group-hover:border-navy-900 transition-colors">
                  <MapPin className="w-4 h-4 text-navy-800 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 group-hover:text-navy-700 transition-colors">Live GIS Vehicle Tracking Console</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">View real-time district map and live speeds</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-navy-800 transition-transform group-hover:translate-x-1 shrink-0" />
            </a>

            <a
              href="/dashboard/complaints"
              className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-sm bg-navy-50 border border-navy-100 flex items-center justify-center shrink-0 group-hover:bg-navy-800 group-hover:border-navy-900 transition-colors">
                  <MessageSquareWarning className="w-4 h-4 text-navy-800 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 group-hover:text-navy-700 transition-colors">Public Grievance Redressal Desk</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Manage citizen complaints and resolution remarks</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-navy-800 transition-transform group-hover:translate-x-1 shrink-0" />
            </a>

            <a
              href="/dashboard/vehicles"
              className="px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-8 h-8 rounded-sm bg-navy-50 border border-navy-100 flex items-center justify-center shrink-0 group-hover:bg-navy-800 group-hover:border-navy-900 transition-colors">
                  <Truck className="w-4 h-4 text-navy-800 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-900 group-hover:text-navy-700 transition-colors">Sanitation Vehicle Directory</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Register collection trucks and link GPS hardware</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-navy-800 transition-transform group-hover:translate-x-1 shrink-0" />
            </a>
          </div>

          <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5">
            <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Authorized access only — Zila Panchayat Admin Panel
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
