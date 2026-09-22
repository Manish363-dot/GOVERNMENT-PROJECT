import { prisma } from '../config/prisma';
import { GpsDevice, VehicleGpsAssignment } from '@prisma/client';

export async function getAllDevices(): Promise<GpsDevice[]> {
  try {
    return await prisma.gpsDevice.findMany({
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    throw new Error('Failed to fetch GPS devices');
  }
}

export async function getDeviceById(id: string): Promise<GpsDevice | null> {
  try {
    return await prisma.gpsDevice.findUnique({
      where: { id }
    });
  } catch (error) {
    return null;
  }
}

export async function createDevice(device: {
  device_name?: string;
  device_identifier: string;
  imei?: string;
}): Promise<GpsDevice> {
  try {
    return await prisma.gpsDevice.create({
      data: {
        device_name: device.device_name || null,
        device_identifier: device.device_identifier,
        imei: device.imei || null,
        status: 'inactive'
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      throw new Error('DEVICE_IDENTIFIER_EXISTS');
    }
    throw new Error('Failed to create GPS device');
  }
}

export async function updateDevice(
  id: string,
  updates: Partial<Pick<GpsDevice, 'device_name' | 'device_identifier' | 'imei' | 'status'>>
): Promise<GpsDevice> {
  try {
    return await prisma.gpsDevice.update({
      where: { id },
      data: updates
    });
  } catch (error) {
    throw new Error('Failed to update GPS device');
  }
}

export async function deleteDevice(id: string): Promise<void> {
  try {
    await prisma.gpsDevice.delete({
      where: { id }
    });
  } catch (error) {
    throw new Error('Failed to delete GPS device');
  }
}

export async function assignDeviceToVehicle(
  vehicleId: string,
  gpsDeviceId: string
): Promise<VehicleGpsAssignment> {
  try {
    return await prisma.$transaction(async (tx) => {
      // Deactivate existing assignments for device
      await tx.vehicleGpsAssignment.updateMany({
        where: { gps_device_id: gpsDeviceId, is_active: true },
        data: { is_active: false, unassigned_at: new Date() }
      });

      // Deactivate existing assignments for vehicle
      await tx.vehicleGpsAssignment.updateMany({
        where: { vehicle_id: vehicleId, is_active: true },
        data: { is_active: false, unassigned_at: new Date() }
      });

      // Create new assignment
      const assignment = await tx.vehicleGpsAssignment.create({
        data: {
          vehicle_id: vehicleId,
          gps_device_id: gpsDeviceId,
          is_active: true
        }
      });

      // Activate the device
      await tx.gpsDevice.update({
        where: { id: gpsDeviceId },
        data: { status: 'active' }
      });

      return assignment;
    });
  } catch (error) {
    throw new Error('Failed to assign GPS device to vehicle');
  }
}

export async function unassignDevice(assignmentId: string): Promise<void> {
  try {
    await prisma.vehicleGpsAssignment.update({
      where: { id: assignmentId },
      data: { is_active: false, unassigned_at: new Date() }
    });
  } catch (error) {
    throw new Error('Failed to unassign GPS device');
  }
}

export async function getActiveAssignments(): Promise<any[]> {
  try {
    return await prisma.vehicleGpsAssignment.findMany({
      where: { is_active: true },
      include: {
        vehicle: true,
        gpsDevice: true
      },
      orderBy: { assigned_at: 'desc' }
    });
  } catch (error) {
    throw new Error('Failed to fetch assignments');
  }
}
