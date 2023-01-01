import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  AndroidLaunchActivityFlag,
} from '@notifee/react-native';
import {Prayer} from '@/adhan';

export type SetAlarmTaskOptions = {
  /** notification id */
  notifId: string;
  /** notification channel id */
  notifChannelId: string;
  /** notification cahnnel name */
  notifChannelName: string;
  /** When the alarm is going to be triggered */
  date: Date;
  /** notification title */
  title: string;
  /** notification subtitle */
  subtitle?: string;
  /** notification body */
  body?: string;
  /** Default: `true` */
  playSound?: boolean;
  /** Default: `false`. this is passed to notification options. */
  isReminder?: Boolean;
  /** which prayer this is about */
  prayer: Prayer;
};

export async function setAlarmTask(options: SetAlarmTaskOptions) {
  /**
   *  general note: we don't check options because we are on typescript and we are not a library,
   *  otherwise all options should have neen checked.
   */

  const {
    date,
    title,
    body,
    subtitle,
    playSound,
    notifChannelId,
    notifChannelName,
    notifId,
  } = options;

  const channelId = await notifee.createChannel({
    id: notifChannelId,
    name: notifChannelName,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  });

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  // to replace the notification settings
  await notifee.cancelTriggerNotification(notifId).catch(console.error);

  await notifee.createTriggerNotification(
    {
      id: notifId,
      title: title,
      subtitle: subtitle,
      body: body,
      android: {
        smallIcon: 'ic_stat_name',
        channelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        autoCancel: !playSound,
        fullScreenAction: playSound
          ? {
              id: 'default',
              launchActivityFlags: [
                AndroidLaunchActivityFlag.NO_HISTORY,
                AndroidLaunchActivityFlag.SINGLE_TOP,
                AndroidLaunchActivityFlag.EXCLUDE_FROM_RECENTS,
              ],
            }
          : undefined,
        pressAction: {
          id: 'default',
        },
        asForegroundService: !!playSound,
        actions: [
          {
            title: t`Dismiss`,
            pressAction: {
              id: 'dismiss_alarm',
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
