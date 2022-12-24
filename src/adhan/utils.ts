import {Prayer, PrayerTimesHelper} from '@/adhan';
import {getNextDayBeginning} from '@/utils/date';

export function getActivePrayer(
  prayerTimes: PrayerTimesHelper | undefined,
  prayersList: Prayer[],
) {
  if (!prayerTimes?.date) return;

  let activePrayer: Prayer | undefined;
  const nextDayBeginning = getNextDayBeginning(new Date());

  if (
    [new Date().toDateString(), nextDayBeginning.toDateString()].includes(
      prayerTimes.date.toDateString(),
    )
  ) {
    for (let prayer of prayersList) {
      if (prayerTimes[prayer] && prayerTimes[prayer].valueOf() > Date.now()) {
        activePrayer = prayer;
        break;
      }
    }
    if (
      !activePrayer &&
      Date.now() - prayerTimes[prayersList[prayersList.length - 1]].valueOf() <
        12 * 60 * 60 * 1000
    ) {
      // edge case
      // probabaly this is midnight before 00:00
      activePrayer = prayersList[prayersList.length - 1];
    }
  }
  return activePrayer;
}
