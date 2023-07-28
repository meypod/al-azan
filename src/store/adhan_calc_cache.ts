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
  return calculatePrayerTimes(date)!;
}

const keysToCache = [...PrayersInOrder, 'date'];

export function cacheMonth(date: Date) {
  let dayToCache = addDays(date, -30);

  for (let i = 0; i <= 31; i++) {
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
