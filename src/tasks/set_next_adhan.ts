import {t} from '@lingui/macro';
import {ToastAndroid} from 'react-native';
import {getPrayerTimes, translatePrayer} from '@/adhan';
import {
  alarmSettings,
  hasAtLeastOneNotificationSetting,
} from '@/store/alarm_settings';
import {settings} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
import {setPreAlarmTask} from '@/tasks/set_pre_alarm';
import {setReminders} from '@/tasks/set_reminder';
import {getTime} from '@/utils/date';

type SetNextAdhanOptions = {
  fromDate?: Date;
  noToast?: boolean;
};

export function setNextAdhan(options?: SetNextAdhanOptions) {
  const notificationSettingsIsValid = hasAtLeastOneNotificationSetting();

  if (!notificationSettingsIsValid) return;

  let targetDate = options?.fromDate || new Date();
  let nextPrayer = getPrayerTimes(targetDate)?.nextPrayer({
    useSettings: true,
    checkNextDays: true,
  });
  if (!nextPrayer) return;

  const {date, prayer, playSound} = nextPrayer!;

  const dismissedAlarmTS = settings.getState().DISMISSED_ALARM_TIMESTAMP;

  if (dismissedAlarmTS >= date.valueOf()) return;

  const showNextPrayerInfo = alarmSettings.getState().SHOW_NEXT_PRAYER_TIME;

  return setPreAlarmTask({
    date,
    prayer,
  })
    .then(() =>
      setAlarmTask({
        date,
        prayer,
        playSound,
        showNextPrayerInfo,
      }),
    )
    .then(() => {
      return setReminders({
        noToast: true,
        date,
        reminders: alarmSettings.getState().REMINDERS,
      });
    })
    .then(() => {
      if (!options?.noToast) {
        const translatedPrayerName = translatePrayer(prayer);
        const time24Format = getTime(date);
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
