import {i18n} from '@lingui/core';
import {ToastAndroid} from 'react-native';
import {getPrayerTimes, prayerTranslations} from '@/adhan';
import {getSettings, hasAtLeastOneNotificationSetting} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
import {setPreAlarmTask} from '@/tasks/set_pre_alarm';
import {getNextDayBeginning, getTime24} from '@/utils/date';

export async function setNextAdhan(fromDate?: Date) {
  const settings = await getSettings();

  if (!settings) return;

  const notificaationSettingsIsValid =
    hasAtLeastOneNotificationSetting(settings);

  if (!notificaationSettingsIsValid) return;

  let targetDate = fromDate || new Date();
  let nextPrayer = (await getPrayerTimes(targetDate))?.nextPrayer(settings);
  if (!nextPrayer) {
    targetDate = getNextDayBeginning(targetDate);
    nextPrayer = (await getPrayerTimes(targetDate))?.nextPrayer(settings);
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
        i18n._({
          message: `Next: ${translatedPrayerName} at ${getTime24(date)}`,
          comment:
            'this message is shown inside the toast that says when the next notification/sound will be shown/played',
        }),
        ToastAndroid.SHORT,
      );
    });
}
