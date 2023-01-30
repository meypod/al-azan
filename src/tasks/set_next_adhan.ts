import {t} from '@lingui/macro';
import {cancelAdhanAlarms} from './cancel_alarms';
import {getPrayerTimes, Prayer, translatePrayer} from '@/adhan';
import {
  ADHAN_NOTIFICATION_ID,
  ADHAN_CHANNEL_ID,
  ADHAN_CHANNEL_NAME,
  PRE_ADHAN_NOTIFICATION_ID,
  PRE_ADHAN_CHANNEL_ID,
  PRE_ADHAN_CHANNEL_NAME,
} from '@/constants/notification';
import {AudioEntry} from '@/modules/media_player';
import {alarmSettings, hasAtLeastOneNotificationSetting} from '@/store/alarm';
import {settings} from '@/store/settings';
import {setAlarmTask} from '@/tasks/set_alarm';
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

  const dismissedAlarmTS =
    settings.getState().DELIVERED_ALARM_TIMESTAMPS[ADHAN_NOTIFICATION_ID] || 0;

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

  const title = translatePrayer(prayer);
  let body: string | undefined = getTime(date);
  let subtitle: string | undefined = body;

  if (showNextPrayerInfo) {
    const next = getPrayerTimes(new Date(date.valueOf() + 1000))?.nextPrayer({
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
    if (prayer === Prayer.Fajr) {
      sound = settings.getState().SELECTED_FAJR_ADHAN_ENTRY as AudioEntry;
    } else {
      sound = settings.getState().SELECTED_ADHAN_ENTRY as AudioEntry;
    }
  }

  const adhanOptions = {
    notifId: ADHAN_NOTIFICATION_ID,
    notifChannelId: ADHAN_CHANNEL_ID,
    notifChannelName: ADHAN_CHANNEL_NAME,
    date,
    title,
    body,
    subtitle,
    sound,
    prayer,
  };

  return setPreAlarmTask({
    ...adhanOptions,
    notifId: PRE_ADHAN_NOTIFICATION_ID,
    notifChannelId: PRE_ADHAN_CHANNEL_ID,
    notifChannelName: PRE_ADHAN_CHANNEL_NAME,
    targetAlarmNotifId: ADHAN_NOTIFICATION_ID,
  })
    .then(() => setAlarmTask(adhanOptions))
    .then(() => {
      if (!options?.noToast) {
        const translatedPrayerName = translatePrayer(prayer);
        let message = t`Next` + ': ' + translatedPrayerName + ',';
        showUpcomingToast({
          message,
          date,
        });
      }
    });
}
