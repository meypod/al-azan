import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import {getPrayerTimes} from '@/adhan';
import {
  WIDGET_UPDATE_CHANNEL_ID,
  WIDGET_UPDATE_CHANNEL_NAME,
  WIDGET_UPDATE_NOTIFICATION_ID,
} from '@/constants/notification';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';

async function createNotificationTrigger(options: {
  channelId: string;
  timestamp: number;
  notificationId: string;
}) {
  const {channelId, notificationId, timestamp} = options;
  // for 00:00 updates
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp,
    alarmManager: true,
  };

  await notifee
    .createTriggerNotification(
      {
        id: notificationId,
        title: t`Updating widgets`,
        android: {
          smallIcon: 'ic_stat_name',
          channelId,
          category: AndroidCategory.SERVICE,
          importance: AndroidImportance.MIN,
          ongoing: true,
        },
        data: {
          timestamp,
        },
      },
      trigger,
    )
    .catch(console.error);
}

export async function setUpdateWidgetsAlarms() {
  const deliveredTS =
    settings.getState().DELIVERED_ALARM_TIMESTAMPS[
      WIDGET_UPDATE_NOTIFICATION_ID
    ] || 0;

  let targetDate = new Date(deliveredTS + 10000);

  if (targetDate.getTime() < Date.now()) {
    targetDate = new Date();
  }

  const nextPrayer = getPrayerTimes(targetDate)?.nextPrayer({
    useSettings: false,
    checkNextDay: true,
  });

  if (!nextPrayer) return;

  const channelId = await notifee.createChannel({
    id: WIDGET_UPDATE_CHANNEL_ID,
    name: WIDGET_UPDATE_CHANNEL_NAME,
    importance: AndroidImportance.MIN,
    visibility: AndroidVisibility.SECRET,
    lights: false,
    badge: false,
    vibration: false,
  });

  const begginingOfNextDay = getNextDayBeginning(new Date()).getTime();

  await Promise.all([
    // for 00:00 updates
    createNotificationTrigger({
      channelId,
      timestamp: begginingOfNextDay,
      notificationId: WIDGET_UPDATE_NOTIFICATION_ID + '-nextday',
    }),
    // for next prayer
    createNotificationTrigger({
      channelId,
      timestamp: nextPrayer.date.getTime(),
      notificationId: WIDGET_UPDATE_NOTIFICATION_ID,
    }),
  ]);
}
