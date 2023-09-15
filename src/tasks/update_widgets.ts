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
import {calcSettings} from '@/store/calculation';
import {settings} from '@/store/settings';
import {getArabicDate, getFormattedDate, getTime} from '@/utils/date';
import {getLocationLabel} from '@/utils/location';

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
    WIDGET_CITY_NAME_POS,
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

  let topStartText = getArabicDate(now);
  let topEndText = getFormattedDate(now, true);

  let locationName = getLocationLabel(calcSettings.getState().LOCATION);

  if (locationName) {
    if (WIDGET_CITY_NAME_POS === 'top_start') {
      topStartText = locationName;
    } else if (WIDGET_CITY_NAME_POS === 'top_end') {
      topEndText = locationName;
    }
  }

  if (settings.getState().SHOW_WIDGET) {
    await updatePermanentNotifWidget({
      topStartText,
      topEndText,
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
    topStartText,
    topEndText,
    prayers,
    adaptiveTheme,
    showCountdown,
    countdownLabel,
    countdownBase,
  });
}
