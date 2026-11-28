interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class RentalMemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private inFlight = new Map<string, Promise<any>>();

  /**
   * Returns cached value if fresh, deduplicates concurrent in-flight lookups,
   * and populates cache with the resolved result.
   */
  async getOrSet<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = this.store.get(key);
    if (cached && cached.expiresAt > now) {
      return cached.value as T;
    }

    const pending = this.inFlight.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    const promise = loader()
      .then((res) => {
        this.store.set(key, {
          value: res,
          expiresAt: Date.now() + ttlMs,
        });
        return res;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Invalidates all cached entries matching any of the given prefixes,
   * or clears the entire cache when no prefixes are passed.
   */
  invalidate(...prefixes: string[]): void {
    if (prefixes.length === 0) {
      this.store.clear();
      return;
    }
    for (const key of this.store.keys()) {
      if (prefixes.some((p) => key.startsWith(p))) {
        this.store.delete(key);
      }
    }
  }
}

export const rentalCache = new RentalMemoryCache();
