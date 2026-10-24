import { Request, Response } from 'express';
import * as vehicleService from '../services/vehicle.service';

/**
 * GET /api/vehicles
 */
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const vehicles = await vehicleService.getAllVehicles();
    res.json({ vehicles });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
}

/**
 * GET /api/vehicles/:id
 */
export async function getById(req: Request, res: Response): Promise<void> {
  try {
    const vehicle = await vehicleService.getVehicleById(req.params.id);
    if (!vehicle) {
      res.status(404).json({ error: 'Vehicle not found' });
      return;
    }
    res.json({ vehicle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
}

/**
 * POST /api/vehicles
 */
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const vehicle = await vehicleService.createVehicle(req.body);
    res.status(201).json({ vehicle });
  } catch (err: any) {
    if (err.message === 'VEHICLE_NUMBER_EXISTS') {
      res.status(409).json({ error: 'Vehicle number already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
}

/**
 * PUT /api/vehicles/:id
 */
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const vehicle = await vehicleService.updateVehicle(req.params.id, req.body);
    res.json({ vehicle });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
}

/**
 * DELETE /api/vehicles/:id
 */
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await vehicleService.deleteVehicle(req.params.id);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
}
