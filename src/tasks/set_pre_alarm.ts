import {i18n} from '@lingui/core';
import {t} from '@lingui/macro';
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
import {calcSettings, getAdhanSettingKey} from '@/store/calculation_settings';
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
    if (!calcSettings.getState()[getAdhanSettingKey(options.prayer, 'sound')])
      return;
    if (options.date === undefined) {
      throw new Error('No date given for pre alarm task');
    }

    const channelId = await notifee.createChannel({
      id: PRE_ADHAN_CHANNEL_ID,
      name: PRE_ADHAN_CHANNEL_NAME,
      visibility: AndroidVisibility.PUBLIC,
    });

    // fire the pre adhan 1 hour remaining to adhan
    let triggerTs = options.date.getTime() - 3600 * 1000;
    // if it goes to the past, make it 10 seconds in the future
    if (triggerTs <= Date.now()) {
      triggerTs = Date.now() + 10000;
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,

      timestamp: triggerTs,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee
      .createTriggerNotification(
        {
          id: PRE_ADHAN_NOTIFICATION_ID,
          title: t({
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
            smallIcon: 'ic_stat_name',
            channelId,
            category: AndroidCategory.ALARM,
            pressAction: {
              id: 'default',
            },
            actions: [
              {
                title: t`Cancel Adhan`,
                pressAction: {
                  id: 'cancel_adhan',
                },
              },
            ],
          },
          data: {
            options: JSON.stringify(options),
          },
        },
        trigger,
      )
      .catch(console.error);
  } finally {
    settingAlarm = false;
  }
}
