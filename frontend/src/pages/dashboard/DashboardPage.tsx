import { useState, useEffect } from 'react';
import { KPICard } from '@/components/KPICard';
import { Truck, MapPin, Radio, MessageSquareWarning } from 'lucide-react';
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
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-poppins text-2xl font-bold text-navy-900">Dashboard Overview</h1>
        <p className="text-sm text-secondary-text mt-1">Real-time system status and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      {/* Quick info */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-poppins font-semibold text-navy-900 mb-3">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-secondary-text">Backend API</span>
              <span className="text-xs font-medium text-success bg-green-50 px-2.5 py-1 rounded-full">Online</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-secondary-text">Supabase Database</span>
              <span className="text-xs font-medium text-success bg-green-50 px-2.5 py-1 rounded-full">Connected</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border/50">
              <span className="text-sm text-secondary-text">Realtime</span>
              <span className="text-xs font-medium text-success bg-green-50 px-2.5 py-1 rounded-full">Active</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-secondary-text">GPS / Traccar</span>
              <span className="text-xs font-medium text-navy-500 bg-navy-50 px-2.5 py-1 rounded-full">Awaiting Setup</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border p-6">
          <h3 className="font-poppins font-semibold text-navy-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <a
              href="/dashboard/vehicles"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Truck className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">Add Vehicle</p>
                <p className="text-xs text-secondary-text">Register a new garbage collection vehicle</p>
              </div>
            </a>
            <a
              href="/dashboard/tracking"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">Live Tracking</p>
                <p className="text-xs text-secondary-text">View vehicles on the real-time map</p>
              </div>
            </a>
            <a
              href="/dashboard/complaints"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-navy-50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageSquareWarning className="w-4 h-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium text-navy-900">Manage Complaints</p>
                <p className="text-xs text-secondary-text">View and resolve citizen complaints</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
