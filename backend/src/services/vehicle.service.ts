import { prisma } from '../config/prisma';
import { Vehicle } from '@prisma/client';

export async function getAllVehicles(): Promise<Vehicle[]> {
  try {
    return await prisma.vehicle.findMany({
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    throw new Error('Failed to fetch vehicles');
  }
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    return await prisma.vehicle.findUnique({
      where: { id }
    });
  } catch (error) {
    return null;
  }
}

export async function createVehicle(vehicle: {
  vehicle_number: string;
  vehicle_name?: string;
  vehicle_type?: string;
}): Promise<Vehicle> {
  try {
    return await prisma.vehicle.create({
      data: {
        vehicle_number: vehicle.vehicle_number.toUpperCase(),
        vehicle_name: vehicle.vehicle_name || null,
        vehicle_type: (vehicle.vehicle_type as any) || 'truck',
        status: 'inactive' as any
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('VEHICLE_NUMBER_EXISTS');
    }
    throw new Error('Failed to create vehicle');
  }
}

export async function updateVehicle(
  id: string,
  updates: Partial<Pick<Vehicle, 'vehicle_number' | 'vehicle_name' | 'vehicle_type' | 'status'>>
): Promise<Vehicle> {
  try {
    return await prisma.vehicle.update({
      where: { id },
      data: updates
    });
  } catch (error) {
    throw new Error('Failed to update vehicle');
  }
}

export async function deleteVehicle(id: string): Promise<void> {
  try {
    await prisma.vehicle.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error('Failed to delete vehicle');
  }
}

export async function getVehicleCount(): Promise<number> {
  try {
    return await prisma.vehicle.count();
  } catch (error) {
    return 0;
  }
}
