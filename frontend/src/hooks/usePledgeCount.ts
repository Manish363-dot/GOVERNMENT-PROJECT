import { useState, useEffect, useCallback } from 'react';
import { pledgeService } from '@/services/pledge.service';
import { useRealtime } from './useRealtime';

const DEFAULT_BASELINE = 0;

export function usePledgeCount() {
  const [count, setCount] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('swachhata_pledge_count');
      if (cached) {
        const val = parseInt(cached, 10);
        if (val === 1428) {
          localStorage.setItem('swachhata_pledge_count', '0');
          return 0;
        }
        if (!isNaN(val) && val >= 0) return val;
      }
    }
    return DEFAULT_BASELINE;
  });

  // Fetch latest from API on mount
  useEffect(() => {
    let isMounted = true;
    pledgeService.getCount().then((val) => {
      if (isMounted && typeof val === 'number') {
        setCount(val);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Listen for local CustomEvent updates (instant zero-delay update when taking pledge)
  useEffect(() => {
    const handleLocalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ count: number }>;
      if (customEvent.detail && typeof customEvent.detail.count === 'number') {
        setCount(customEvent.detail.count);
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'swachhata_pledge_count' && e.newValue) {
        const val = parseInt(e.newValue, 10);
        if (!isNaN(val)) {
          setCount(val);
        }
      }
    };

    window.addEventListener('pledge_count_updated', handleLocalUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('pledge_count_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Real-time WebSocket updates across all connected clients
  useRealtime<{ count: number }>('pledge_count_updated', (payload) => {
    if (payload && typeof payload.count === 'number') {
      setCount(payload.count);
      localStorage.setItem('swachhata_pledge_count', payload.count.toString());
    }
  });

  const increment = useCallback(async () => {
    return await pledgeService.increment();
  }, []);

  return { count, increment };
}
