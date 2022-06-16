import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
import {ToastAndroid} from 'react-native';
import {getPrayerTimes, prayerTranslations} from '@/adhan';
import {hasAtLeastOneNotificationSetting} from '@/store/settings';
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
      ToastAndroid.show(
        t({
          message: `Next: ${translatedPrayerName} at ${getTime24(date)}`,
          comment:
            'this message is shown inside the toast that says when the next notification/sound will be shown/played',
        }),
        ToastAndroid.SHORT,
      );
    });
}
