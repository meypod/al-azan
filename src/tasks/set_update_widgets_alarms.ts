import {setAlarm} from 'react-native-alarm-module';
import {getPrayerTimes, PrayersInOrder} from '@/adhan';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';

export function setUpdateWidgetsAlarms() {
  let targetDate = new Date();

  let {LAST_WIDGET_UPDATE} = settings.getState();

  // when the last alarm goes off, it gets past this if
  // because till the last alarm, this condition always returns
  // so that we dont end up setting many alarms
  if (targetDate.valueOf() < LAST_WIDGET_UPDATE) return;

  let prayerTimes = getPrayerTimes(targetDate);

  if (!prayerTimes) return; // cant get prayer times to set alarms

  const begginingOfNextDay = getNextDayBeginning(targetDate).valueOf();
  LAST_WIDGET_UPDATE = begginingOfNextDay;
  // day change update
  setAlarm({
    timestamp: begginingOfNextDay,
    taskName: 'update_screen_widget_task', // reuse the task name for widget module update request
    allowedInForeground: true,
    type: 'setExact',
    wakeup: false,
    keepAwake: false,
  });

  for (const prayer of PrayersInOrder) {
    setAlarm({
      timestamp: prayerTimes[prayer].valueOf(),
      taskName: 'update_screen_widget_task',
      allowedInForeground: true,
      type: 'setExact',
      wakeup: false,
      keepAwake: false,
    });
    if (prayerTimes[prayer].valueOf() > LAST_WIDGET_UPDATE) {
      LAST_WIDGET_UPDATE = prayerTimes[prayer].valueOf();
    }
  }

  settings.setState({LAST_WIDGET_UPDATE});
}
