/**
 * Mawaqit Prayer Times Cache
 * Caches fetched prayer times from Mawaqit for one day at a time
 */

import {storage} from './mmkv';
import {getDayBeginning} from '@/utils/date';
import type {MawaqitPrayerTimes} from '@/services/mawaqit_service';

const MAWAQIT_CACHE_PREFIX = 'MAWAQIT_';
const MAWAQIT_RETRY_PREFIX = 'MAWAQIT_RETRY_';

/**
 * Get cache key for a specific date
 */
function getMawaqitDayKey(date: Date): string {
  return MAWAQIT_CACHE_PREFIX + getDayBeginning(date).valueOf();
}

/**
 * Get retry tracking key for a specific date
 */
function getMawaqitRetryKey(date: Date): string {
  return MAWAQIT_RETRY_PREFIX + getDayBeginning(date).valueOf();
}

export type MawaqitCacheEntry = {
  prayerTimes: MawaqitPrayerTimes;
  fetchedAt: number; // timestamp
  mosqueUrl: string; // to detect if URL changed
};

export type MawaqitRetryInfo = {
  lastAttempt: number; // timestamp
  attemptCount: number;
  nextRetryAfter: number; // timestamp when we can retry again
};

/**
 * Get cached Mawaqit prayer times for a specific date
 * @param date Date to get cached times for
 * @param mosqueUrl Current mosque URL (to invalidate if changed)
 * @returns Cached prayer times or null if not found or invalid
 */
export function getCachedMawaqitPrayerTimes(
  date: Date,
  mosqueUrl: string,
): MawaqitPrayerTimes | null {
  try {
    const cacheKey = getMawaqitDayKey(date);
    const cached = storage.getString(cacheKey);

    if (!cached) {
      return null;
    }

    const entry: MawaqitCacheEntry = JSON.parse(cached, (_, value) => {
      // Revive Date objects
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
        return new Date(value);
      }
      return value;
    });

    // Invalidate cache if mosque URL changed
    if (entry.mosqueUrl !== mosqueUrl) {
      console.log('Mawaqit cache invalidated: mosque URL changed');
      storage.delete(cacheKey);
      return null;
    }

    // Invalidate cache if it's for a past day and we're now on a new day
    const cachedDay = getDayBeginning(entry.prayerTimes.date);
    const requestedDay = getDayBeginning(date);
    const today = getDayBeginning(new Date());

    if (cachedDay.valueOf() !== requestedDay.valueOf()) {
      return null;
    }

    // If the cached day is in the past and we're checking from today, it's still valid
    // But if it's for today and we're past midnight, invalidate
    if (cachedDay.valueOf() < today.valueOf() && requestedDay.valueOf() === today.valueOf()) {
      console.log('Mawaqit cache invalidated: new day started');
      storage.delete(cacheKey);
      return null;
    }

    return entry.prayerTimes;
  } catch (error) {
    console.error('Error reading Mawaqit cache:', error);
    return null;
  }
}

/**
 * Cache Mawaqit prayer times for a specific date
 * @param date Date to cache times for
 * @param prayerTimes Prayer times to cache
 * @param mosqueUrl Mosque URL used to fetch these times
 */
export function cacheMawaqitPrayerTimes(
  date: Date,
  prayerTimes: MawaqitPrayerTimes,
  mosqueUrl: string,
): void {
  try {
    const cacheKey = getMawaqitDayKey(date);
    const entry: MawaqitCacheEntry = {
      prayerTimes,
      fetchedAt: Date.now(),
      mosqueUrl,
    };

    storage.set(cacheKey, JSON.stringify(entry));

    // Clear retry info on successful cache
    const retryKey = getMawaqitRetryKey(date);
    storage.delete(retryKey);
  } catch (error) {
    console.error('Error caching Mawaqit prayer times:', error);
  }
}

/**
 * Get retry information for a specific date
 * @param date Date to check retry info for
 * @returns Retry info or null if no retry tracking exists
 */
export function getMawaqitRetryInfo(date: Date): MawaqitRetryInfo | null {
  try {
    const retryKey = getMawaqitRetryKey(date);
    const retryData = storage.getString(retryKey);

    if (!retryData) {
      return null;
    }

    return JSON.parse(retryData);
  } catch (error) {
    console.error('Error reading Mawaqit retry info:', error);
    return null;
  }
}

/**
 * Record a failed fetch attempt and calculate next retry time
 * @param date Date that failed to fetch
 */
export function recordMawaqitFetchFailure(date: Date): void {
  try {
    const retryKey = getMawaqitRetryKey(date);
    const existing = getMawaqitRetryInfo(date);

    const now = Date.now();
    const attemptCount = (existing?.attemptCount || 0) + 1;

    // Exponential backoff: 5min, 15min, 30min, 1hr, 2hr, then 4hr max
    const backoffMinutes = Math.min(
      5 * Math.pow(2, attemptCount - 1),
      240, // 4 hours max
    );
    const nextRetryAfter = now + backoffMinutes * 60 * 1000;

    const retryInfo: MawaqitRetryInfo = {
      lastAttempt: now,
      attemptCount,
      nextRetryAfter,
    };

    storage.set(retryKey, JSON.stringify(retryInfo));
  } catch (error) {
    console.error('Error recording Mawaqit fetch failure:', error);
  }
}

/**
 * Check if we should retry fetching Mawaqit prayer times
 * @param date Date to check
 * @returns true if we should retry, false if we should wait
 */
export function shouldRetryMawaqitFetch(date: Date): boolean {
  const retryInfo = getMawaqitRetryInfo(date);

  if (!retryInfo) {
    // No retry info means we haven't tried yet or it succeeded before
    return true;
  }

  // Check if enough time has passed since last attempt
  const now = Date.now();
  return now >= retryInfo.nextRetryAfter;
}

/**
 * Clear all Mawaqit cache entries
 */
export function clearMawaqitCache(): void {
  try {
    const allKeys = storage.getAllKeys();
    for (const key of allKeys) {
      if (key.startsWith(MAWAQIT_CACHE_PREFIX) || key.startsWith(MAWAQIT_RETRY_PREFIX)) {
        storage.delete(key);
      }
    }
  } catch (error) {
    console.error('Error clearing Mawaqit cache:', error);
  }
}

/**
 * Clear old Mawaqit cache entries (older than specified days)
 * @param daysToKeep Number of days to keep in cache (default 7)
 */
export function clearOldMawaqitCache(daysToKeep: number = 7): void {
  try {
    const cutoffTime = Date.now() - daysToKeep * 24 * 60 * 60 * 1000;
    const allKeys = storage.getAllKeys();

    for (const key of allKeys) {
      if (key.startsWith(MAWAQIT_CACHE_PREFIX) || key.startsWith(MAWAQIT_RETRY_PREFIX)) {
        const [, timestampStr] = key.split('_').slice(-2);
        const timestamp = parseInt(timestampStr, 10);

        if (timestamp < cutoffTime) {
          storage.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('Error clearing old Mawaqit cache:', error);
  }
}
