import { Request, Response } from 'express';
import * as gpsDeviceService from '../services/gpsDevice.service';

/**
 * GET /api/gps-devices
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const devices = await gpsDeviceService.getAllDevices();
    res.json({ devices });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GPS devices' });
  }
}

/**
 * GET /api/gps-devices/:id
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const device = await gpsDeviceService.getDeviceById(req.params.id);
    if (!device) {
      res.status(404).json({ error: 'GPS device not found' });
      return;
    }
    res.json({ device });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch GPS device' });
  }
}

/**
 * POST /api/gps-devices
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const device = await gpsDeviceService.createDevice(req.body);
    res.status(201).json({ device });
  } catch (err: any) {
    if (err.message === 'DEVICE_IDENTIFIER_EXISTS') {
      res.status(409).json({ error: 'Device identifier already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create GPS device' });
  }
}

/**
 * PUT /api/gps-devices/:id
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const device = await gpsDeviceService.updateDevice(req.params.id, req.body);
    res.json({ device });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update GPS device' });
  }
}

/**
 * DELETE /api/gps-devices/:id
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await gpsDeviceService.deleteDevice(req.params.id);
    res.json({ message: 'GPS device deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete GPS device' });
  }
}

/**
 * POST /api/gps-devices/assign
 */
export async function assign(req: Request, res: Response): Promise<void> {
  try {
    const { vehicle_id, gps_device_id } = req.body;
    const assignment = await gpsDeviceService.assignDeviceToVehicle(vehicle_id, gps_device_id);
    res.status(201).json({ assignment });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign GPS device' });
  }
}

/**
 * POST /api/gps-devices/unassign
 */
export async function unassign(req: Request, res: Response): Promise<void> {
  try {
    const { assignment_id } = req.body;
    await gpsDeviceService.unassignDevice(assignment_id);
    res.json({ message: 'GPS device unassigned successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to unassign GPS device' });
  }
}

/**
 * GET /api/gps-devices/assignments
 */
export async function getAssignments(req: Request, res: Response): Promise<void> {
  try {
    const assignments = await gpsDeviceService.getActiveAssignments();
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}
