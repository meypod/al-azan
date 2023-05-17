import {t} from '@lingui/macro';
import difference from 'lodash/difference';
import {
  getNextPrayer,
  getPrayerTimes,
  Prayer,
  PrayersInOrder,
  translatePrayer,
} from '@/adhan';
import {getActivePrayer} from '@/adhan/utils';
import {isRTL} from '@/i18n';
import {updateScreenWidget} from '@/modules/screen_widget';
import {
  cancelPermanentNotifWidget,
  updatePermanentNotifWidget,
} from '@/notifee';
import {settings} from '@/store/settings';
import {getArabicDate, getFormattedDate, getTime} from '@/utils/date';

function getCountdownLabel(prayer: Prayer) {
  return t`Remaining till` + ' ' + translatePrayer(prayer) + ': ';
}

export async function updateWidgets() {
  const now = new Date();

  const prayerTimes = getPrayerTimes(now);

  if (!prayerTimes) return;

  const {
    HIDDEN_WIDGET_PRAYERS: hiddenPrayers,
    ADAPTIVE_WIDGETS: adaptiveTheme,
    SHOW_WIDGET_COUNTDOWN: showCountdown,
    HIGHLIGHT_CURRENT_PRAYER,
  } = settings.getState();

  const visiblePrayerTimes = difference(PrayersInOrder, hiddenPrayers);

  let activePrayer: Prayer | undefined = undefined;

  if (prayerTimes && visiblePrayerTimes.length) {
    activePrayer = getActivePrayer(
      now,
      visiblePrayerTimes,
      HIGHLIGHT_CURRENT_PRAYER,
    );
  }

  let countdownLabel: string | null = null;
  let countdownBase: string | null = null;
  if (prayerTimes && showCountdown) {
    if (activePrayer && !HIGHLIGHT_CURRENT_PRAYER) {
      countdownLabel = getCountdownLabel(activePrayer);
      countdownBase = prayerTimes[activePrayer].valueOf().toString();
    } else {
      const next = getNextPrayer({
        checkNextDay: true,
        date: now,
        prayers: visiblePrayerTimes,
        useSettings: false,
      });
      if (next) {
        countdownLabel = getCountdownLabel(next.prayer);
        countdownBase = next.date.valueOf().toString();
      }
    }
  }

  const prayers = visiblePrayerTimes.map(
    p =>
      [
        translatePrayer(p),
        prayerTimes ? getTime(prayerTimes[p]) : '--:--',
        p === activePrayer,
      ] as [prayerName: string, prayerTime: string, isActive: Boolean],
  );

  if (!isRTL) {
    prayers.reverse();
  }

  const secondaryDate = getFormattedDate(now);
  const hijriDate = getArabicDate(now);

  if (settings.getState().SHOW_WIDGET) {
    await updatePermanentNotifWidget({
      secondaryDate,
      hijriDate,
      prayers,
      adaptiveTheme,
      showCountdown,
      countdownLabel,
      countdownBase,
    }).catch(console.error);
  } else {
    await cancelPermanentNotifWidget();
  }

  await updateScreenWidget({
    secondaryDate,
    hijriDate,
    prayers,
    adaptiveTheme,
    showCountdown,
    countdownLabel,
    countdownBase,
  });
}
