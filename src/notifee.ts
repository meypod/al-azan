import notifee, {
  EventType,
  EventDetail,
  AndroidImportance,
  AndroidVisibility,
  Notification,
} from '@notifee/react-native';
import {finishAndRemoveTask, isDndActive} from './modules/activity';
import {isIntrusive, isSilent} from './modules/media_player';
import {Reminder, reminderSettings} from './store/reminder';
import {settings} from './store/settings';
import {SetPreAlarmTaskOptions} from './tasks/set_pre_alarm';
import {setReminders} from './tasks/set_reminder';
import {bootstrap} from '@/bootstrap';
import {
  ADHAN_CHANNEL_ID,
  PRE_ADHAN_CHANNEL_ID,
  PRE_REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_ID,
  WIDGET_CHANNEL_ID,
  WIDGET_CHANNEL_NAME,
  WIDGET_NOTIFICATION_ID,
  WIDGET_UPDATE_CHANNEL_ID,
} from '@/constants/notification';
import {
  updateNotification,
  UpdateWidgetOptions,
} from '@/modules/notification_widget';
import {playAudio, stopAudio} from '@/services/audio_service';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

export type NotifeeEvent = {
  type: EventType;
  detail: EventDetail;
  options: SetAlarmTaskOptions | undefined;
};

export type CancelNotifOptions = {
  notification: Notification | undefined;
  options: SetAlarmTaskOptions | undefined;
  /** should the notification be replaced with a notification without actions after it was cancelled ? */
  replaceWithNormal?: boolean;
};

export async function cancelAlarmNotif({
  options,
  notification,
  replaceWithNormal,
}: CancelNotifOptions) {
  if (!isSilent(options?.sound)) {
    await stopAudio().catch(console.error);
    await notifee.stopForegroundService().catch(console.error);
  }

  if (options?.notifId) {
    await notifee
      .cancelDisplayedNotification(options.notifId)
      .catch(console.error);
  }

  if (replaceWithNormal && notification) {
    await notifee
      .displayNotification({
        ...notification,
        id: undefined, // to assign a unique id to it
        android: {
          ...notification.android,
          actions: undefined,
          asForegroundService: false,
          fullScreenAction: undefined,
          pressAction: {
            id: 'default',
          },
          importance: AndroidImportance.DEFAULT,
        },
      })
      .catch(console.error);
  }
}

export function getAlarmOptions(notification: Notification | undefined) {
  if (!notification || !notification.data?.options) return;

  let options;
  try {
    options = JSON.parse(
      notification.data.options as string,
    ) as SetAlarmTaskOptions;
  } catch (e) {
    console.error(
      'Faulty options: ',
      notification.data?.options,
      ' Error: ',
      e,
    );
  }

  if (options) {
    options.date = new Date(options.date);
  } else {
    return;
  }

  return options;
}

export async function getSecheduledAlarmOptions(targetAlarmNotifId: string) {
  const scheduledNotif = await notifee
    .getTriggerNotifications()
    .then(notifs => notifs.find(n => n.notification.id === targetAlarmNotifId))
    .catch(console.error);
  return getAlarmOptions(scheduledNotif?.notification);
}

export async function getFgSvcNotification() {
  try {
    const fgNotify = await notifee
      .getDisplayedNotifications()
      .then(list =>
        list.find(n => !!n.notification.android?.asForegroundService),
      );
    return fgNotify?.notification;
  } catch (e) {
    console.error(e);
  }
  return;
}

async function handleNotification({
  detail,
  type,
}: Omit<NotifeeEvent, 'options'>) {
  bootstrap();

  const {notification} = detail;
  const channelId = notification?.android?.channelId || '';

  if (
    [
      ADHAN_CHANNEL_ID,
      REMINDER_CHANNEL_ID,
      PRE_ADHAN_CHANNEL_ID,
      PRE_REMINDER_CHANNEL_ID,
    ].includes(channelId)
  ) {
    const options = getAlarmOptions(notification)!;

    if (
      type === EventType.DELIVERED ||
      type === EventType.UNKNOWN ||
      type === EventType.FG_ALREADY_EXIST
    ) {
      if (
        settings.getState().DELIVERED_ALARM_TIMESTAMPS[options.notifId] ===
        options.date.getTime()
      ) {
        // we already have processed this notification
        return;
      }
      settings
        .getState()
        .saveTimestamp(options.notifId, options.date.getTime());

      if (
        (type === EventType.FG_ALREADY_EXIST || type === EventType.UNKNOWN) &&
        notification
      ) {
        await notifee
          .displayNotification({
            ...notification,
            android: {
              ...notification.android,
              actions: undefined,
              asForegroundService: false,
              fullScreenAction: undefined,
              importance: AndroidImportance.DEFAULT,
            },
          })
          .catch(console.error);
      }

      if (isIntrusive(options.sound)) {
        // even though we could not check options.playSound and
        // this would simply become a noop,
        // we have to reduce the cpu usage as much as we can
        // so we try not to hit third party code when not necessary
        await notifee
          .cancelNotification('pre-' + options.notifId)
          .catch(console.error);
      }

      if (channelId === ADHAN_CHANNEL_ID) {
        await Promise.all([
          setNextAdhan(),
          updateWidgets(),
          setUpdateWidgetsAlarms(),
        ]);
      } else if (channelId === REMINDER_CHANNEL_ID) {
        if ((options as Pick<Reminder, 'once'>).once) {
          reminderSettings.getState().disableReminder({id: options.notifId});
        }
        await setReminders();
      }
    } else if (type !== EventType.TRIGGER_NOTIFICATION_CREATED) {
      const {pressAction} = detail;

      if (type === EventType.DISMISSED || pressAction?.id === 'dismiss_alarm') {
        await cancelAlarmNotif({notification: detail.notification, options});
      } else if (pressAction?.id === 'cancel_alarm') {
        // 'cancel_alarm' only exists on a pre-alarm notification
        const scheduledAlarmOptions = await getSecheduledAlarmOptions(
          (options as SetPreAlarmTaskOptions).targetAlarmNotifId,
        );

        if (scheduledAlarmOptions) {
          await notifee.cancelNotification(scheduledAlarmOptions.notifId);

          // save date of upcoming alarm to prevent setting alarm/prealarm before it
          settings
            .getState()
            .saveTimestamp(
              scheduledAlarmOptions.notifId,
              scheduledAlarmOptions.date.getTime(),
            );

          if (scheduledAlarmOptions.notifChannelId === ADHAN_CHANNEL_ID) {
            await setNextAdhan();
          } else if (
            scheduledAlarmOptions.notifChannelId === REMINDER_CHANNEL_ID
          ) {
            if ((scheduledAlarmOptions as Pick<Reminder, 'once'>).once) {
              reminderSettings.getState().disableReminder({
                id: scheduledAlarmOptions.notifId,
              });
            }
            await setReminders();
          }
        }
      }
    }
  } else if (channelId === WIDGET_UPDATE_CHANNEL_ID) {
    if (type !== EventType.TRIGGER_NOTIFICATION_CREATED) {
      const notifId = notification!.id!;
      const triggerDate = notification?.data?.timestamp as number | undefined;
      if (triggerDate) {
        settings.getState().saveTimestamp(notifId, triggerDate);
      }
      await Promise.all([updateWidgets(), setUpdateWidgetsAlarms()]);
      await notifee.cancelNotification(notifId).catch(console.error);
    }
  }
}

export function setupNotifeeForegroundHandler() {
  return notifee.onForegroundEvent(({type, detail}) =>
    handleNotification({type, detail}),
  );
}

export function setupNotifeeHandlers() {
  notifee.onBackgroundEvent(({type, detail}) =>
    handleNotification({type, detail}),
  );

  notifee.registerForegroundService(async notification => {
    bootstrap();

    const channelId = notification?.android?.channelId;
    if (channelId === ADHAN_CHANNEL_ID || channelId === REMINDER_CHANNEL_ID) {
      const options = getAlarmOptions(notification);

      if (!isSilent(options?.sound)) {
        const canBypassDnd = (
          await notifee.getChannel(channelId).catch(console.error)
        )?.bypassDnd;

        const isDnd = await isDndActive();

        if (!isDnd || canBypassDnd) {
          await playAudio(options!.sound!)
            .then(interrupted =>
              cancelAlarmNotif({
                notification,
                options,
                replaceWithNormal: !interrupted,
              }),
            )
            .finally(() => finishAndRemoveTask());
        }
      }
    }
  });
}

export type updateWidgetOptions = Pick<
  UpdateWidgetOptions,
  'dayAndMonth' | 'hijriDate' | 'prayers'
>;

export async function updatePermanentNotifWidget({
  dayAndMonth,
  hijriDate,
  prayers,
}: updateWidgetOptions) {
  const channelId = await notifee.createChannel({
    id: WIDGET_CHANNEL_ID,
    name: WIDGET_CHANNEL_NAME,
    importance: AndroidImportance.LOW,
    visibility: AndroidVisibility.PUBLIC,
  });

  await updateNotification({
    dayAndMonth,
    hijriDate,
    prayers,
    channelId,
    notificationId: WIDGET_NOTIFICATION_ID,
  });
}

export function cancelPermanentNotifWidget() {
  return notifee.cancelDisplayedNotification(WIDGET_NOTIFICATION_ID);
}
