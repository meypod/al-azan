import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
} from '@notifee/react-native';
import {getNextPrayer} from '@/adhan';
import {
  WIDGET_UPDATE_CHANNEL_ID,
  WIDGET_UPDATE_NOTIFICATION_ID,
} from '@/constants/notification';
import {settings} from '@/store/settings';
import {getNextDayBeginning} from '@/utils/date';

async function createNotificationTrigger(options: {
  channelId: string;
  timestamp: number;
  notificationId: string;
}) {
  await notifee
    .cancelDisplayedNotifications([
      WIDGET_UPDATE_NOTIFICATION_ID + '-nextday',
      WIDGET_UPDATE_NOTIFICATION_ID,
    ])
    .catch(console.error);

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

  const nextPrayer = getNextPrayer({
    date: targetDate,
    useSettings: false,
    checkNextDay: true,
  });

  if (!nextPrayer) return;

  const begginingOfNextDay = getNextDayBeginning(new Date()).getTime();

  await Promise.all([
    // for 00:00 updates
    createNotificationTrigger({
      channelId: WIDGET_UPDATE_CHANNEL_ID,
      timestamp: begginingOfNextDay,
      notificationId: WIDGET_UPDATE_NOTIFICATION_ID + '-nextday',
    }),
    // for next prayer
    createNotificationTrigger({
      channelId: WIDGET_UPDATE_CHANNEL_ID,
      timestamp: nextPrayer.date.getTime(),
      notificationId: WIDGET_UPDATE_NOTIFICATION_ID,
    }),
  ]);
}
