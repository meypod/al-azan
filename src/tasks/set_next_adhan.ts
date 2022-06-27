import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {ToastAndroid} from 'react-native';
import {getPrayerTimes, prayerTranslations} from '@/adhan';
import {hasAtLeastOneNotificationSetting} from '@/store/calculation_settings';
import {settings} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
import {setPreAlarmTask} from '@/tasks/set_pre_alarm';
import {getNextDayBeginning, getTime24} from '@/utils/date';

export function setNextAdhan(fromDate?: Date) {
  const notificaationSettingsIsValid = hasAtLeastOneNotificationSetting();

  if (!notificaationSettingsIsValid) return;

  let targetDate = fromDate || new Date();
  let nextPrayer = getPrayerTimes(targetDate)?.nextPrayer(true);
  if (!nextPrayer) {
    targetDate = getNextDayBeginning(targetDate);
    nextPrayer = getPrayerTimes(targetDate)?.nextPrayer(true);
  }
  if (!nextPrayer) return;

  const {date, prayer, playSound} = nextPrayer!;

  const dismissedAlarmTS = settings.getState().DISMISSED_ALARM_TIMESTAMP;

  if (dismissedAlarmTS >= date.valueOf()) return;

  return setPreAlarmTask({
    date,
    prayer,
  })
    .then(() =>
      setAlarmTask({
        date,
        prayer,
        playSound,
      }),
    )
    .then(() => {
      const translatedPrayerName = i18n._(
        prayerTranslations[prayer.toLowerCase()],
      );
      const time24Format = getTime24(date);
      ToastAndroid.show(
        t({
          message: `Next: ${translatedPrayerName}, ${time24Format}`,
          comment:
            'this message is shown inside the toast that says when the next notification/sound will be shown/played',
        }) + (date.getDay() !== new Date().getDay() ? ' ' + t`Tomorrow` : ''),
        ToastAndroid.SHORT,
      );
    });
}
