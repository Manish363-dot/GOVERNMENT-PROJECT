import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import { Truck, MapPin, Radio, MessageSquareWarning, ShieldCheck } from 'lucide-react';
import { vehicleService } from '@/services/vehicle.service';
import { trackingService } from '@/services/tracking.service';
import { complaintService } from '@/services/complaint.service';
import type { DashboardStats } from '@/types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    liveVehicles: 0,
    onlineDevices: 0,
    newComplaints: 0,
  });
  const [loading, setLoading] = useState(true);

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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-poppins text-xl sm:text-2xl font-bold text-navy-900">
              Dashboard Overview
            </h1>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wide">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              उत्तराखंड प्रशासन
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time District Fleet Status & Key Grievance Metrics
          </p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon={Truck}
          color="blue"
          loading={loading}
        />
        <KPICard
          title="Live Vehicles"
          value={stats.liveVehicles}
          icon={MapPin}
          color="green"
          loading={loading}
        />
        <KPICard
          title="Online GPS"
          value={stats.onlineDevices}
          icon={Radio}
          color="orange"
          loading={loading}
        />
        <KPICard
          title="New Complaints"
          value={stats.newComplaints}
          icon={MessageSquareWarning}
          color="red"
          loading={loading}
        />
      </div>

      {/* System Operational Status & Administrative Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <h3 className="font-poppins font-bold text-navy-900 text-sm">System Operational Status</h3>
            <span className="text-[10px] font-mono font-medium text-slate-500">Government Portal Services</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-700">Backend API Gateway</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">Operational</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-700">Supabase Database Cluster</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-700">Realtime Event Stream</span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">Active</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-medium text-slate-700">Traccar GPS Tracking Engine</span>
              <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">Awaiting GPS Setup</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
            <h3 className="font-poppins font-bold text-navy-900 text-sm">Administrative Quick Operations</h3>
            <span className="text-[10px] font-mono font-medium text-slate-500">Zila Panchayat Desk</span>
          </div>
          <div className="space-y-2">
            <a
              href="/dashboard/vehicles"
              className="flex items-center gap-3 p-3 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-navy-900 text-amber-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">Manage Garbage Fleet Vehicles</p>
                <p className="text-[11px] text-slate-500">Register new collection trucks and assign drivers</p>
              </div>
            </a>

            <a
              href="/dashboard/tracking"
              className="flex items-center gap-3 p-3 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-emerald-800 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">Live District GPS Map</p>
                <p className="text-[11px] text-slate-500">Monitor vehicle routes and current live coordinates</p>
              </div>
            </a>

            <a
              href="/dashboard/complaints"
              className="flex items-center gap-3 p-3 rounded-md border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <div className="w-8 h-8 rounded bg-amber-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                <MessageSquareWarning className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">Public Grievance Redressal</p>
                <p className="text-[11px] text-slate-500">Review citizen complaints and update resolution status</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
