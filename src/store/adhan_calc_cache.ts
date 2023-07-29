import {storage} from './mmkv';
import {Prayer, PrayersInOrder, calculatePrayerTimes} from '@/adhan';
import {addDays, getDayBeginning, getNextDayBeginning} from '@/utils/date';

const CACHE_PREFIX = 'PTC_';

function getDayKey(date: Date) {
  return CACHE_PREFIX + getDayBeginning(date).valueOf();
}

export type CachedPrayerTimes = Record<Prayer, Date> & {
  date: Date;
};

export function getCachedPrayerTimes(
  date: Date,
  /** recurse option, don't use outside of this function */
  secondTime: boolean = false,
): CachedPrayerTimes {
  const prayerTime = storage.getString(getDayKey(date));
  if (prayerTime) {
    const prayerTimeParsed = JSON.parse(prayerTime, (_, value) => {
      if (typeof value === 'string') {
        return new Date(value);
      }
      return value;
    });

    return prayerTimeParsed;
  } else if (!secondTime) {
    // clear cached months older than 60 days when caching new month
    clearTill(addDays(date, -60));
    cacheMonth(date);
    return getCachedPrayerTimes(date, true);
  }
  throw new Error('INVALID_CACHE');
}

const keysToCache = [...PrayersInOrder, 'date'];

function getMonthBeginning(date: Date) {
  const beginningOfMonth = new Date(date.valueOf());
  beginningOfMonth.setHours(0, 0, 0, 0);
  beginningOfMonth.setDate(1);
  return beginningOfMonth;
}

export function cacheMonth(date: Date) {
  let dayToCache = getMonthBeginning(date);

  while (dayToCache.getMonth() === date.getMonth()) {
    const prayerTimes = calculatePrayerTimes(dayToCache);
    storage.set(
      getDayKey(dayToCache),
      JSON.stringify(prayerTimes, keysToCache),
    );
    dayToCache = getNextDayBeginning(dayToCache);
  }
}

export function clearCache() {
  for (const k of storage.getAllKeys()) {
    if (k.startsWith(CACHE_PREFIX)) {
      storage.delete(k);
    }
  }
}

export function clearTill(date: Date) {
  for (const k of storage.getAllKeys()) {
    if (k.startsWith(CACHE_PREFIX)) {
      const [, dayValueOfStr] = k.split('_');
      if (parseInt(dayValueOfStr, 10) < date.valueOf()) {
        storage.delete(k);
      }
    }
  }
}
