import {t} from '@lingui/macro';
import {ToastAndroid} from 'react-native';
import {getPrayerTimes, translatePrayer} from '@/adhan';
import {hasAtLeastOneNotificationSetting} from '@/store/calculation_settings';
import {settings} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
import {setPreAlarmTask} from '@/tasks/set_pre_alarm';
import {getNextDayBeginning, getTime24} from '@/utils/date';

type SetNextAdhanOptions = {
  fromDate?: Date;
  noToast?: boolean;
};

export function setNextAdhan(options?: SetNextAdhanOptions) {
  const notificationSettingsIsValid = hasAtLeastOneNotificationSetting();

  if (!notificationSettingsIsValid) return Promise.reject();

  let targetDate = options?.fromDate || new Date();
  let nextPrayer = getPrayerTimes(targetDate)?.nextPrayer(true);
  if (!nextPrayer) {
    targetDate = getNextDayBeginning(targetDate);
    nextPrayer = getPrayerTimes(targetDate)?.nextPrayer(true);
  }
  if (!nextPrayer) return Promise.reject();

  const {date, prayer, playSound} = nextPrayer!;

  const dismissedAlarmTS = settings.getState().DISMISSED_ALARM_TIMESTAMP;

  if (dismissedAlarmTS >= date.valueOf()) return Promise.reject();

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
      if (!options?.noToast) {
        const translatedPrayerName = translatePrayer(prayer);
        const time24Format = getTime24(date);
        ToastAndroid.show(
          t`Next` +
            ': ' +
            translatedPrayerName +
            ', ' +
            time24Format +
            (date.getDay() !== new Date().getDay() ? ' ' + t`Tomorrow` : ''),
          ToastAndroid.SHORT,
        );
      }
    });
}
