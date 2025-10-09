// Simple in-memory cache for API responses

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Get data from cache if not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const now = Date.now();
    const age = now - entry.timestamp;

    if (age > entry.expiresIn) {
      // Cache expired, remove it
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with expiration time
   * @param key - Cache key
   * @param data - Data to cache
   * @param expiresIn - Expiration time in milliseconds (default: 60 seconds)
   */
  set<T>(key: string, data: T, expiresIn: number = 60000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn,
    });
  }

  /**
   * Delete a specific cache entry
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  BOURSE_QUOTE: 'bourse:quote',
  BOURSE_INTRADAY: 'bourse:intraday',
  BOURSE_COMPOSITION: 'bourse:composition',
  BOURSE_ALL: 'bourse:all',
};

// Cache expiration times (in milliseconds)
export const CACHE_TTL = {
  QUOTE: 60000, // 1 minute
  INTRADAY: 300000, // 5 minutes
  COMPOSITION: 300000, // 5 minutes
  ALL: 60000, // 1 minute
};
