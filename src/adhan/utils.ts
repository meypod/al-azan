import {Prayer, PrayerTime, getNextPrayer, getCurrentPrayer} from '@/adhan';
import {addDays} from '@/utils/date';

export function getActivePrayer(
  lookingAtDay: Date,
  prayersList: Prayer[],
  /** return current active prayer instead of next prayer */
  current?: boolean,
): Prayer | undefined {
  if (!lookingAtDay || !prayersList.length) return;
  const now = new Date();

  if (current) {
    const activePrayer = getCurrentPrayer({date: now, prayers: prayersList});
    if (
      activePrayer?.calculatedFrom.toDateString() ===
      lookingAtDay.toDateString()
    ) {
      return activePrayer.prayer;
    }
    return;
  }

  const activePrayer: PrayerTime | undefined = getNextPrayer({
    date: now,
    prayers: prayersList,
    checkNextDay: true,
  });

  if (!activePrayer) return;

  // handles the general case
  if (
    activePrayer.calculatedFrom.toDateString() === lookingAtDay.toDateString()
  ) {
    return activePrayer.prayer;
  }

  const tomorrow = addDays(now, 1);

  // when looking at tomorrow, if next prayer is on tomorrow, assume it's the first visible prayer time
  if (
    lookingAtDay.toDateString() === tomorrow.toDateString() &&
    activePrayer.calculatedFrom.toDateString() === tomorrow.toDateString()
  ) {
    return prayersList[0];
  }

  return;
}
