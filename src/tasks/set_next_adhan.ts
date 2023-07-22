import {t} from '@lingui/macro';
import {AlarmType} from '@notifee/react-native';
import {cancelAdhanAlarms} from './cancel_alarms';
import {translatePrayer} from '@/adhan';
import {getNextPrayer} from '@/adhan/prayer_times';
import {
  ADHAN_NOTIFICATION_ID,
  ADHAN_CHANNEL_ID,
  ADHAN_DND_CHANNEL_ID,
  PRE_ADHAN_NOTIFICATION_ID,
  PRE_ADHAN_CHANNEL_ID,
} from '@/constants/notification';
import {AudioEntry} from '@/modules/media_player';
import {alarmSettings, hasAtLeastOneNotificationSetting} from '@/store/alarm';
import {settings} from '@/store/settings';
import {SetAlarmTaskOptions, setAlarmTask} from '@/tasks/set_alarm';
import {setPreAlarmTask} from '@/tasks/set_pre_alarm';
import {getTime} from '@/utils/date';
import {canScheduleNotifications} from '@/utils/permission';
import {getUpcommingTimeDay, showUpcomingToast} from '@/utils/upcoming';

type SetNextAdhanOptions = {
  noToast?: boolean;
};

export async function setNextAdhan(
  options?: SetNextAdhanOptions,
): Promise<void> {
  const notificationSettingsIsValid = hasAtLeastOneNotificationSetting();

  if (!notificationSettingsIsValid) {
    void cancelAdhanAlarms();
    return;
  }

  if (!(await canScheduleNotifications())) {
    return;
  }

  const {
    DELIVERED_ALARM_TIMESTAMPS,
    SELECTED_ADHAN_ENTRIES,
    SAVED_ADHAN_AUDIO_ENTRIES,
    USE_DIFFERENT_ALARM_TYPE,
    BYPASS_DND,
  } = settings.getState();

  const deliveredTS = DELIVERED_ALARM_TIMESTAMPS[ADHAN_NOTIFICATION_ID] || 0;

  let targetDate = new Date(deliveredTS + 10000);

  if (targetDate.getTime() < Date.now()) {
    targetDate = new Date();
  }

  let nextPrayer = getNextPrayer({
    date: targetDate,
    useSettings: true,
    checkNextDays: true,
  });
  if (!nextPrayer) {
    return;
  }

  const {date, prayer, playSound} = nextPrayer!;

  if (deliveredTS >= date.getTime()) {
    return;
  }

  const {SHOW_NEXT_PRAYER_TIME, DONT_TURN_ON_SCREEN, VIBRATION_MODE} =
    alarmSettings.getState();

  const title = translatePrayer(prayer);
  let body: string | undefined = getTime(date);
  let subtitle: string | undefined = body;

  if (SHOW_NEXT_PRAYER_TIME) {
    const next = getNextPrayer({
      date: new Date(date.valueOf() + 1000),
      checkNextDays: true,
      useSettings: true,
    });
    if (next) {
      body += ` - ${t`Next`}: ${translatePrayer(
        next.prayer,
      )}, ${getUpcommingTimeDay(next.date)}`;
    }
  }

  let sound: AudioEntry | undefined = undefined;
  if (playSound) {
    sound = (SELECTED_ADHAN_ENTRIES[prayer] ||
      SELECTED_ADHAN_ENTRIES['default']) as AudioEntry;

    if (!sound) {
      sound = SAVED_ADHAN_AUDIO_ENTRIES[0] as AudioEntry;
    }
  }

  const adhanOptions: SetAlarmTaskOptions = {
    notifId: ADHAN_NOTIFICATION_ID,
    notifChannelId: BYPASS_DND ? ADHAN_DND_CHANNEL_ID : ADHAN_CHANNEL_ID,
    date,
    title,
    body,
    subtitle,
    sound,
    prayer,
    alarmType: USE_DIFFERENT_ALARM_TYPE
      ? AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE
      : AlarmType.SET_ALARM_CLOCK,
    dontTurnOnScreen: DONT_TURN_ON_SCREEN,
    vibrationMode: VIBRATION_MODE,
  };

  await setAlarmTask(adhanOptions);
  await setPreAlarmTask({
    ...adhanOptions,
    notifId: PRE_ADHAN_NOTIFICATION_ID,
    notifChannelId: PRE_ADHAN_CHANNEL_ID,
    targetAlarmNotifId: ADHAN_NOTIFICATION_ID,
  });

  if (!options?.noToast) {
    const translatedPrayerName = translatePrayer(prayer);
    let message = t`Next` + ': ' + translatedPrayerName + ',';
    showUpcomingToast({
      message,
      date,
    });
  }
}
