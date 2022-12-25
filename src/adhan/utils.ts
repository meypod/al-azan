import {Prayer, getPrayerTimes, PrayerTime} from '@/adhan';
import {addDays, getDayBeginning} from '@/utils/date';

export function getActivePrayer(
  lookingAtDay: Date,
  prayersList: Prayer[],
): Prayer | undefined {
  if (!lookingAtDay || !prayersList.length) return;
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const yesterday = addDays(now, -1);

  const activePrayer: PrayerTime | undefined = getPrayerTimes(now)?.nextPrayer({
    prayers: prayersList,
    checkNextDay: true,
  });

  if (!activePrayer) return;

  if (
    lookingAtDay.toDateString() === now.toDateString() &&
    activePrayer.date.toDateString() === now.toDateString()
  ) {
    return activePrayer.prayer;
  }

  if (
    lookingAtDay.toDateString() === tomorrow.toDateString() &&
    activePrayer.date.toDateString() === tomorrow.toDateString()
  ) {
    return prayersList[0];
  }

  if (lookingAtDay.toDateString() === yesterday.toDateString()) {
    const yesterdayPrayers = getPrayerTimes(
      new Date(getDayBeginning(now).valueOf() - 1000),
    );
    if (
      yesterdayPrayers &&
      now.valueOf() <
        yesterdayPrayers[prayersList[prayersList.length - 1]].valueOf()
    ) {
      return prayersList[prayersList.length - 1];
    }
  }

  return;
}
