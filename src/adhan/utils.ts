import {Prayer, PrayerTime, getNextPrayer, getCurrentPrayer} from '@/adhan';

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

  // handles when highlighting the tahajjud of previous day, but we need to handle fajr as well
  if (lookingAtDay.toDateString() === now.toDateString()) {
    return prayersList[0];
  }

  return;
}
