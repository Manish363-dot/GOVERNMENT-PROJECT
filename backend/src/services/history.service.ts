import { prisma } from '../config/prisma';
import { VehicleLocationHistory } from '@prisma/client';

export async function getVehicleHistory(
  vehicleId: string,
  date: string
): Promise<{
  history: VehicleLocationHistory[];
  summary: {
    totalPoints: number;
    startTime: Date | null;
    endTime: Date | null;
    totalDistance: number;
  };
}> {
  const startOfDay = new Date(`${date}T00:00:00.000Z`);
  const endOfDay = new Date(`${date}T23:59:59.999Z`);

  try {
    const history = await prisma.vehicleLocationHistory.findMany({
      where: {
        vehicle_id: vehicleId,
        recorded_at: {
          gte: startOfDay,
          lte: endOfDay
        }
      },
      orderBy: { recorded_at: 'asc' }
    });

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
  } catch (error) {
    throw new Error('Failed to fetch vehicle history');
  }
}

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

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
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
