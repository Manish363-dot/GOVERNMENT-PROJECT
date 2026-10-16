import { api } from './api';

const STORAGE_KEY = 'swachhata_pledge_count';
const DEFAULT_BASELINE = 0;

export interface PledgeCountResponse {
  success: boolean;
  count: number;
  lastUpdated?: string;
}

export const pledgeService = {
  /**
   * Get current pledge count from backend with localStorage fallback
   */
  async getCount(): Promise<number> {
    try {
      const res = await api.get<PledgeCountResponse>('/pledge/count');
      if (res && typeof res.count === 'number') {
        localStorage.setItem(STORAGE_KEY, res.count.toString());
        return res.count;
      }
    } catch (err) {
      console.warn('[Pledge Service] Could not fetch remote count, using cached/fallback:', err);
    }

    // Fallback to local storage or baseline
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = parseInt(cached, 10);
      if (parsed === 1428) {
        localStorage.setItem(STORAGE_KEY, '0');
        return 0;
      }
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }

    return DEFAULT_BASELINE;
  },

  /**
   * Increment pledge count when a citizen takes / downloads their pledge certificate
   */
  async increment(): Promise<number> {
    let newCount = 1;

    // Optimistically calculate local increment
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const parsed = parseInt(cached, 10);
      if (!isNaN(parsed) && parsed !== 1428) {
        newCount = parsed + 1;
      }
    }
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    // Broadcast immediate local event for snappy UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pledge_count_updated', { detail: { count: newCount } }));
    }

    try {
      const res = await api.post<PledgeCountResponse>('/pledge/increment', {});
      if (res && typeof res.count === 'number') {
        newCount = res.count;
        localStorage.setItem(STORAGE_KEY, newCount.toString());
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('pledge_count_updated', { detail: { count: newCount } }));
        }
      }
    } catch (err) {
      console.warn('[Pledge Service] Remote increment failed, kept local count:', err);
    }

    return newCount;
  },
};
