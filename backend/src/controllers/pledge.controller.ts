import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// Store outside src so tsx watch does not trigger a server reload on file writes
const DATA_DIR = path.resolve(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'pledge-stats.json');

// Real-time counter starts from 0 (increments with each certificate download)
const DEFAULT_INITIAL_COUNT = 0;

interface PledgeStats {
  count: number;
  lastUpdated: string;
}

function ensureDataFile(): PledgeStats {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      const initial: PledgeStats = {
        count: DEFAULT_INITIAL_COUNT,
        lastUpdated: new Date().toISOString(),
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (typeof parsed.count === 'number' && !isNaN(parsed.count)) {
      return parsed;
    }
  } catch (err) {
    console.error('[Pledge Controller] Error reading pledge data:', err);
  }

  return {
    count: DEFAULT_INITIAL_COUNT,
    lastUpdated: new Date().toISOString(),
  };
}

function saveStats(stats: PledgeStats): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(stats, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Pledge Controller] Error writing pledge data:', err);
  }
}

/**
 * GET /api/pledge/count
 * Retrieve current count of citizens who have taken the pledge.
 */
export async function getPledgeCount(_req: Request, res: Response): Promise<void> {
  try {
    const stats = ensureDataFile();
    res.json({
      success: true,
      count: stats.count,
      lastUpdated: stats.lastUpdated,
    });
  } catch (error) {
    console.error('[Pledge Controller] getPledgeCount failed:', error);
    res.status(500).json({ error: 'Failed to retrieve pledge count', count: DEFAULT_INITIAL_COUNT });
  }
}

/**
 * POST /api/pledge/increment
 * Increment the pledge count upon certificate download / completion.
 * Broadcasts real-time count to all connected clients via Socket.io.
 */
export async function incrementPledgeCount(req: Request, res: Response): Promise<void> {
  try {
    const stats = ensureDataFile();
    stats.count += 1;
    stats.lastUpdated = new Date().toISOString();
    saveStats(stats);

    // Broadcast updated count over Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('pledge_count_updated', { count: stats.count, lastUpdated: stats.lastUpdated });
    }

    res.json({
      success: true,
      count: stats.count,
      message: 'Pledge count incremented successfully',
    });
  } catch (error) {
    console.error('[Pledge Controller] incrementPledgeCount failed:', error);
    res.status(500).json({ error: 'Failed to increment pledge count' });
  }
}
