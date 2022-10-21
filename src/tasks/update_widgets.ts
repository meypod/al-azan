import difference from 'lodash/difference';
import {getPrayerTimes, PrayersInOrder, translatePrayer} from '@/adhan';
import {getActivePrayer} from '@/adhan/utils';
import WidgetMod from '@/modules/screen_widget';
import {
  cancelPermanentNotifWidget,
  updatePermanentNotifWidget,
} from '@/notifee';
import {settings} from '@/store/settings';
import {getArabicDate, getDay, getMonthName, getTime} from '@/utils/date';

export async function updateWidgets() {
  const now = new Date();

  const prayerTimes = getPrayerTimes(now);

  const hiddenPrayers = settings.getState().HIDDEN_WIDGET_PRAYERS;

  const visiblePrayerTimes = difference(PrayersInOrder, hiddenPrayers);

  const activePrayer = prayerTimes
    ? getActivePrayer(prayerTimes, visiblePrayerTimes)
    : undefined;

  const prayers = visiblePrayerTimes.map(
    p =>
      [
        translatePrayer(p),
        prayerTimes ? getTime(prayerTimes[p]) : '--:--',
        p === activePrayer,
      ] as [prayerName: string, prayerTime: string, isActive: Boolean],
  );

  const dayAndMonth = getMonthName(now) + ', ' + getDay(now);
  const hijriDate = getArabicDate(now);

  if (settings.getState().SHOW_WIDGET) {
    updatePermanentNotifWidget({
      dayAndMonth,
      hijriDate,
      prayers,
    }).catch(console.error);
  } else {
    cancelPermanentNotifWidget();
  }

  await WidgetMod.updateScreenWidget({
    dayAndMonth,
    hijriDate,
    prayers,
  });
}
