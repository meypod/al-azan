import {Prayer} from '@/adhan';
import {CachedPrayerTimes} from '@/store/adhan_calc_cache';
import {getNextDayBeginning} from '@/utils/date';

export function getActivePrayer(
  prayerTimes: CachedPrayerTimes | undefined,
  prayersList: Prayer[],
) {
  if (!prayerTimes?.date) return;

  let activePrayer: Prayer | undefined;
  const nextDayBeginning = getNextDayBeginning(prayerTimes.date);

  if (
    [prayerTimes.date.toDateString(), nextDayBeginning.toDateString()].includes(
      new Date().toDateString(),
    )
  ) {
    for (let prayer of prayersList) {
      if (prayerTimes[prayer] && prayerTimes[prayer].valueOf() > Date.now()) {
        activePrayer = prayer;
        break;
      }
    }
  }
  return activePrayer;
}
