import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidCategory,
  AndroidVisibility,
} from '@notifee/react-native';
import {Prayer, prayerTranslations} from '@/adhan';
import {
  PRE_ADHAN_CHANNEL_ID,
  PRE_ADHAN_CHANNEL_NAME,
  PRE_ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';
import {i18n} from '@/i18n';
import {getDayName, getTime24} from '@/utils/date';

export type SetPreAlarmTaskOptions = {
  /** When the adhan is  */
  date: Date;
  /** which adhan it is ? */
  prayer: Prayer;
};

let settingAlarm = false;
export async function setPreAlarmTask(options: SetPreAlarmTaskOptions) {
  if (settingAlarm) return;
  settingAlarm = true;

  try {
    if (options.date === undefined) {
      return;
    }

    const channelId = await notifee.createChannel({
      id: PRE_ADHAN_CHANNEL_ID,
      name: PRE_ADHAN_CHANNEL_NAME,
      visibility: AndroidVisibility.PUBLIC,
    });

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      // fire the pre adhan 1 hour remaining to adhan
      timestamp: options.date.getTime() - 3600 * 1000,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: PRE_ADHAN_NOTIFICATION_ID,
        title: i18n._({
          message: 'Upcoming alarm',
          comment: 'notification title',
        }),
        body:
          i18n._(prayerTranslations[options.prayer.toLowerCase()]) +
          ', ' +
          getDayName(options.date, 'short') +
          ' ' +
          getTime24(options.date),
        android: {
          channelId,
          category: AndroidCategory.ALARM,
          pressAction: {
            id: 'default',
          },
          actions: [
            {
              title: 'Dismiss',
              pressAction: {
                id: 'dismiss',
              },
            },
          ],
        },
        data: {
          options: JSON.stringify(options),
        },
      },
      trigger,
    );
  } finally {
    settingAlarm = false;
  }
}
