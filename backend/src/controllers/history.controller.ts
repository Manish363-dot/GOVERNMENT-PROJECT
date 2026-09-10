import { Request, Response } from 'express';
import * as historyService from '../services/history.service';

/**
 * GET /api/history?vehicleId=xxx&date=2026-09-10
 * Authenticated — returns vehicle location history for a specific date.
 */
export async function getHistory(req: Request, res: Response): Promise<void> {
  try {
    const { vehicleId, date } = req.query as { vehicleId: string; date: string };

    if (!vehicleId || !date) {
      res.status(400).json({ error: 'vehicleId and date are required' });
      return;
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
      return;
    }

    const result = await historyService.getVehicleHistory(vehicleId, date);

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vehicle history' });
  }
}
