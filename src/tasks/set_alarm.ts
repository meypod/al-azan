import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
} from '@notifee/react-native';
import {Prayer} from '@/adhan';
import {AudioEntry, isIntrusive, isSilent} from '@/modules/media_player';

export type SetAlarmTaskOptions = {
  /** notification id */
  notifId: string;
  /** notification channel id */
  notifChannelId: string;
  /** When the alarm is going to be triggered */
  date: Date;
  /** notification title */
  title: string;
  /** notification subtitle */
  subtitle?: string;
  /** notification body */
  body?: string;
  sound?: AudioEntry;
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

  const {date, title, body, subtitle, sound, notifChannelId, notifId} = options;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  const intrusive = isIntrusive(sound);
  const silent = isSilent(sound);

  await notifee.createTriggerNotification(
    {
      id: notifId,
      title: title,
      subtitle: subtitle,
      body: body,
      android: {
        lightUpScreen: intrusive,
        smallIcon: 'ic_stat_name',
        channelId: notifChannelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        autoCancel: !intrusive,
        fullScreenAction: intrusive
          ? {
              id: 'fullscreen',
              launchActivity: 'com.github.meypod.al_azan.AlarmActivity',
            }
          : undefined,
        pressAction: intrusive
          ? {
              id: 'fullscreen',
              launchActivity: 'com.github.meypod.al_azan.AlarmActivity',
            }
          : {
              id: 'dismiss_alarm',
              launchActivity: 'com.github.meypod.al_azan.MainActivity',
            },
        asForegroundService: !silent,
        actions: silent
          ? undefined
          : [
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
