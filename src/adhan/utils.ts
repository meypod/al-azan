import {Prayer, PrayerTime, getNextPrayer} from '@/adhan';

export function getActivePrayer(
  lookingAtDay: Date,
  prayersList: Prayer[],
): Prayer | undefined {
  if (!lookingAtDay || !prayersList.length) return;
  const now = new Date();

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
