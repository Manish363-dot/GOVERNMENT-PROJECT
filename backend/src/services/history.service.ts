import { supabaseAdmin } from '../config/supabase';
import { VehicleLocationHistory } from '../types';

/**
 * Get vehicle location history for a specific date.
 * Optimized: only returns data for the selected vehicle and date.
 */
export async function getVehicleHistory(
  vehicleId: string,
  date: string
): Promise<{
  history: VehicleLocationHistory[];
  summary: {
    totalPoints: number;
    startTime: string | null;
    endTime: string | null;
    totalDistance: number;
  };
}> {
  // Calculate date range (start and end of the selected day)
  const startOfDay = new Date(`${date}T00:00:00.000Z`).toISOString();
  const endOfDay = new Date(`${date}T23:59:59.999Z`).toISOString();

  const { data, error } = await supabaseAdmin
    .from('vehicle_location_history')
    .select('*')
    .eq('vehicle_id', vehicleId)
    .gte('recorded_at', startOfDay)
    .lte('recorded_at', endOfDay)
    .order('recorded_at', { ascending: true });

  if (error) throw new Error('Failed to fetch vehicle history');

  const history = data || [];

  // Calculate summary
  const totalPoints = history.length;
  const startTime = history.length > 0 ? history[0].recorded_at : null;
  const endTime = history.length > 0 ? history[history.length - 1].recorded_at : null;
  const totalDistance = calculateTotalDistance(history);

  return {
    history,
    summary: {
      totalPoints,
      startTime,
      endTime,
      totalDistance: Math.round(totalDistance * 100) / 100,
    },
  };
}

/**
 * Calculate total distance from GPS points using Haversine formula.
 */
function calculateTotalDistance(points: VehicleLocationHistory[]): number {
  let total = 0;

  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].latitude,
      points[i - 1].longitude,
      points[i].latitude,
      points[i].longitude
    );
  }

  return total;
}

/**
 * Haversine formula to calculate distance between two GPS coordinates.
 * Returns distance in kilometers.
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
