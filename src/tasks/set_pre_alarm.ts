import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidCategory,
} from '@notifee/react-native';
import {SetAlarmTaskOptions} from './set_alarm';
import {isIntrusive} from '@/modules/media_player';
import {alarmSettings} from '@/store/alarm';
import {getTime} from '@/utils/date';

export type SetPreAlarmTaskOptions = SetAlarmTaskOptions & {
  targetAlarmNotifId: string;
};

export async function setPreAlarmTask(options: SetPreAlarmTaskOptions) {
  const {date, title, sound, notifChannelId, notifId} = options;

  // to replace the notification settings
  await notifee.cancelNotification(notifId).catch(console.error);

  // We don't need a pre alarm for alarms that do not play sound.
  if (!isIntrusive(sound) || alarmSettings.getState().DONT_NOTIFY_UPCOMING) {
    return;
  }

  // fire the pre adhan 1 hour remaining to adhan
  let triggerTs = date.getTime() - 3600 * 1000;
  // if it goes to the past, make it 10 seconds in the future
  if (triggerTs <= Date.now()) {
    triggerTs = Date.now() + 10000;
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerTs,
    alarmManager: true,
  };

  await notifee.createTriggerNotification(
    {
      id: notifId,
      title: t({
        message: 'Upcoming alarm',
        comment: 'notification title',
      }),
      body: title + ', ' + getTime(date),
      android: {
        smallIcon: 'ic_stat_name',
        channelId: notifChannelId,
        category: AndroidCategory.ALARM,
        pressAction: {
          id: 'default',
        },
        actions: [
          {
            title: t`Cancel`,
            pressAction: {
              id: 'cancel_alarm',
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
}
