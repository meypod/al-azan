import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AlarmType,
} from '@notifee/react-native';
import {Prayer} from '@/adhan';
import {VibrationMode} from '@/modules/activity';
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
  /** Alarm type to use with alarm manager */
  alarmType: AlarmType;
  /** if true, won't launch any activity when alarm triggers and won't light up screen */
  dontTurnOnScreen?: boolean;
  vibrationMode?: VibrationMode;
  /** this is set by setAlarmTask function. indicates that a sound is going to be played by this alarm and the sound is not short. */
  readonly intrusive?: boolean;
};

type Mutable<T> = {
  -readonly [k in keyof T]: T[k];
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
    sound,
    notifChannelId,
    notifId,
    alarmType,
    dontTurnOnScreen,
  } = options;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
    alarmManager: {
      type: alarmType,
    },
  };

  const intrusive = isIntrusive(sound);
  (options as Mutable<SetAlarmTaskOptions>).intrusive = intrusive;
  const silent = isSilent(sound);
  await notifee.createTriggerNotification(
    {
      id: notifId,
      title: title,
      subtitle: subtitle,
      body: body,
      android: {
        smallIcon: 'ic_stat_name',
        channelId: notifChannelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        autoCancel: !intrusive,
        fullScreenAction:
          !dontTurnOnScreen && intrusive
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
