import {t} from '@lingui/macro';
import notifee, {
  TimestampTrigger,
  TriggerType,
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  AndroidLaunchActivityFlag,
} from '@notifee/react-native';
import {getPrayerTimes, Prayer, translatePrayer} from '@/adhan';
import {
  ADHAN_CHANNEL_ID,
  ADHAN_CHANNEL_NAME,
  ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';
import {settings} from '@/store/settings';
import {getTime} from '@/utils/date';

export type SetAlarmTaskOptions = {
  /** When the adhan is  */
  date: Date;
  /** which adhan it is ? */
  prayer: Prayer;
  /** Default: `true` */
  showNotification?: boolean;
  /** Default: `true` */
  playSound?: boolean;
  /** Default: `true` */
  fullScreen?: boolean;
  /** Default: `false` */
  showNextPrayerInfo?: boolean;
};

export async function setAlarmTask(options: SetAlarmTaskOptions) {
  if (options.date === undefined) {
    throw new Error('No date given for main alarm task');
  }
  if (options.showNotification === undefined) {
    options.showNotification = true;
  }
  if (options.fullScreen === undefined) {
    options.fullScreen = true;
  }
  if (options.playSound === undefined) {
    options.playSound = true;
  }

  const channelId = await notifee.createChannel({
    id: ADHAN_CHANNEL_ID,
    name: ADHAN_CHANNEL_NAME,
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
  });

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: options.date.getTime(),
    alarmManager: {
      allowWhileIdle: true,
    },
  };

  let body;

  if (options.showNextPrayerInfo) {
    const next = getPrayerTimes(
      new Date(options.date.valueOf() + 1000),
    )?.nextPrayer({
      checkNextDays: true,
      useSettings: true,
    });
    if (next) {
      body =
        `${t`Next`}: ${translatePrayer(next.prayer)}, ${getTime(next.date)}` +
        (next.date.toDateString() !== options.date.toDateString()
          ? ' ' + t`Tomorrow`
          : '');
    }
  }

  // to replace the notification settings
  await notifee
    .cancelTriggerNotification(ADHAN_NOTIFICATION_ID)
    .catch(console.error);

  await notifee.createTriggerNotification(
    {
      id: ADHAN_NOTIFICATION_ID,
      title: translatePrayer(options.prayer),
      subtitle: getTime(options.date),
      body,
      android: {
        smallIcon: 'ic_stat_name',
        channelId,
        category: AndroidCategory.ALARM,
        importance: AndroidImportance.HIGH,
        autoCancel: !options.playSound,
        fullScreenAction:
          options.playSound && options.fullScreen
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
        asForegroundService: options.playSound,
        actions: [
          {
            title: t`Dismiss`,
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
  settings.setState({
    SCHEDULED_ALARM_TIMESTAMP: options.date.getTime().valueOf(),
  });
}
