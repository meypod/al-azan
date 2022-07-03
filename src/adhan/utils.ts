import {Prayer, PrayerTimesExtended} from '@/adhan';

export function getActivePrayer(
  prayerTimes: PrayerTimesExtended | undefined,
  prayersList: Prayer[],
) {
  let activePrayer: Prayer | undefined;

  if (new Date().toDateString() === prayerTimes?.date?.toDateString()) {
    for (let prayer of prayersList) {
      if (prayerTimes[prayer] && prayerTimes[prayer].valueOf() > Date.now()) {
        activePrayer = prayer;
        break;
      }
    }
  }
  return activePrayer;
}
