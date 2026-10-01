import { Request, Response } from 'express';
import * as historyService from '../services/history.service';

/**
 * GET /api/history?vehicleId=xxx&date=2026-09-10
 * Authenticated — returns vehicle location history for a specific date.
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId, date } = req.query as { vehicleId: string; date: string };


    const result = await historyService.getVehicleHistory(vehicleId, date);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle history' });
  }
}
