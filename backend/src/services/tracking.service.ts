import { prisma } from '../config/prisma';

export async function getLiveLocations(): Promise<any[]> {
  try {
    const locations = await prisma.vehicleCurrentLocation.findMany({
      include: {
        vehicle: {
          select: { id: true, vehicle_number: true, vehicle_name: true, vehicle_type: true, status: true }
        }
      },
      orderBy: { updated_at: 'desc' }
    });
    return locations;
  } catch (error) {
    throw new Error('Failed to fetch live locations');
  }
}

export async function getVehicleLiveLocation(vehicleId: string) {
  try {
    return await prisma.vehicleCurrentLocation.findUnique({
      where: { vehicle_id: vehicleId }
    });
  } catch (error) {
    return null;
  }
}

export async function getLiveVehicleCount(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    return await prisma.vehicleCurrentLocation.count({
      where: { updated_at: { gte: fiveMinutesAgo } }
    });
  } catch (error) {
    return 0;
  }
}

export async function getOnlineDeviceCount(): Promise<number> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  try {
    return await prisma.gpsDevice.count({
      where: { 
        status: 'active',
        last_seen_at: { gte: fiveMinutesAgo }
      }
    });
  } catch (error) {
    return 0;
  }
}
