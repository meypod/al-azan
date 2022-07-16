import {setAlarm} from 'react-native-alarm-module';
import {getPrayerTimes, PrayersInOrder} from '@/adhan';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';

export function setUpdateWidgetsAlarms() {
  let targetDate = new Date();

  let lastAlarmDateValueOf = settings.getState().LAST_ALARM_DATE_VALUEOF;

  // when the last alarm goes off, it gets past this if
  // because till the last alarm, this condition always returns
  if (targetDate.valueOf() < lastAlarmDateValueOf) return;

  let prayerTimes = getPrayerTimes(targetDate);

  if (!prayerTimes) return; // cant get prayer times to set alarms

  // day change update
  setAlarm({
    timestamp: getNextDayBeginning(targetDate).valueOf(),
    taskName: 'update_screen_widget_task', // reuse the task name for widget module update request
    allowedInForeground: true,
    type: 'setAndAllowWhileIdle',
    wakeup: false,
    keepAwake: false,
  });

  for (const prayer of PrayersInOrder) {
    setAlarm({
      timestamp: prayerTimes[prayer].valueOf(),
      taskName: 'update_screen_widget_task',
      allowedInForeground: true,
      type: 'setAndAllowWhileIdle',
      wakeup: false,
      keepAwake: false,
    });
    lastAlarmDateValueOf = prayerTimes[prayer].valueOf();
  }

  settings.setState({LAST_ALARM_DATE_VALUEOF: lastAlarmDateValueOf});
}
