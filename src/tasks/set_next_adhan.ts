import {t} from '@lingui/macro';
import {ToastAndroid} from 'react-native';
import {cancelAlarmsAndReminders} from './cancel_alarms';
import {getPrayerTimes, translatePrayer} from '@/adhan';
import {
  alarmSettings,
  hasAtLeastOneNotificationSetting,
} from '@/store/alarm_settings';
import {settings} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
import {setPreAlarmTask} from '@/tasks/set_pre_alarm';
import {setReminders} from '@/tasks/set_reminder';
import {addDays, getDayName, getTime} from '@/utils/date';

type SetNextAdhanOptions = {
  noToast?: boolean;
};

export function setNextAdhan(options?: SetNextAdhanOptions) {
  const notificationSettingsIsValid = hasAtLeastOneNotificationSetting();

  if (!notificationSettingsIsValid) {
    void cancelAlarmsAndReminders();
    return;
  }

  const dismissedAlarmTS = settings.getState().DISMISSED_ALARM_TIMESTAMP;

  let targetDate = new Date(dismissedAlarmTS + 10000);

  if (targetDate.valueOf() < Date.now()) {
    targetDate = new Date();
  }

  let nextPrayer = getPrayerTimes(targetDate)?.nextPrayer({
    useSettings: true,
    checkNextDays: true,
  });
  if (!nextPrayer) return;

  const {date, prayer, playSound} = nextPrayer!;

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
        let message =
          t`Next` + ': ' + translatedPrayerName + ', ' + time24Format;

        if (date.toDateString() !== new Date().toDateString()) {
          if (date.toDateString() === addDays(new Date(), 1).toDateString()) {
            message += ' ' + t`Tomorrow`;
          } else {
            message += ' ' + getDayName(date);
          }
        }
        ToastAndroid.show(message, ToastAndroid.SHORT);
      }
    });
}
