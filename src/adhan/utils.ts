import {Prayer, getPrayerTimes} from '@/adhan';
import {addDays} from '@/utils/date';

export function getActivePrayer(date: Date, prayersList: Prayer[]) {
  if (!date) return;
  let activePrayer: Prayer | undefined;
  const now = new Date();
  const tomorrow = addDays(now, 1);

  const nowPrayers = getPrayerTimes(now);
  const tomorrowPrayers = getPrayerTimes(tomorrow);
  if (!nowPrayers || !tomorrowPrayers) return;

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday || isTomorrow) {
    for (let prayer of prayersList) {
      if (nowPrayers[prayer] && Date.now() < nowPrayers[prayer].valueOf()) {
        activePrayer = prayer;
        break;
      }
    }

    if (!activePrayer) {
      activePrayer = prayersList[prayersList.length - 1];
    }

    if (isTomorrow) {
      if (
        Date.now() < tomorrowPrayers[prayersList[0]].valueOf() &&
        activePrayer === prayersList[prayersList.length - 1]
      ) {
        activePrayer = prayersList[0];
      } else {
        activePrayer = undefined;
      }
    }
  }
  return activePrayer;
}
