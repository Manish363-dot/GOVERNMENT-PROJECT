import { prisma } from '../config/prisma';
import { GpsDevice, VehicleGpsAssignment } from '@prisma/client';

export async function getAllDevices(): Promise<any[]> {
  try {
    const devices = await prisma.gpsDevice.findMany({
      orderBy: { created_at: 'desc' },
      include: {
        vehicleAssignments: {
          where: { is_active: true },
          include: { vehicle: true },
        },
      },
    });
    
    const now = Date.now();
    return devices.map(d => {
      const activeVehicle = d.vehicleAssignments?.[0]?.vehicle || null;
      let status = d.status;
      if (!d.last_seen_at) {
        status = 'inactive';
      } else {
        const isOffline = (now - d.last_seen_at.getTime()) > 5 * 60 * 1000;
        status = isOffline ? 'inactive' : 'active';
      }
      return {
        ...d,
        status,
        assigned_vehicle: activeVehicle ? {
          id: activeVehicle.id,
          vehicle_number: activeVehicle.vehicle_number,
          vehicle_name: activeVehicle.vehicle_name,
        } : null,
      };
    });
  } catch (error) {
    throw new Error('Failed to fetch GPS devices');
  }
}

export async function getDeviceById(id: string): Promise<any | null> {
  try {
    return await prisma.gpsDevice.findUnique({
      where: { id },
      include: {
        vehicleAssignments: {
          where: { is_active: true },
          include: { vehicle: true },
        },
      },
    });
  } catch (error) {
    return null;
  }
}

export async function createDevice(device: {
  device_name?: string;
  device_identifier: string;
  imei?: string;
  sim_number?: string;
}): Promise<GpsDevice> {
  try {
    return await prisma.gpsDevice.create({
      data: {
        device_name: device.device_name || null,
        device_identifier: device.device_identifier,
        imei: device.imei || device.device_identifier,
        sim_number: device.sim_number || null,
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
  updates: Partial<Pick<GpsDevice, 'device_name' | 'device_identifier' | 'imei' | 'sim_number' | 'status'>>
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
