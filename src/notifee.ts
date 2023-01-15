import {bootstrap} from '@/bootstrap';
import notifee, {
  EventType,
  EventDetail,
  AndroidImportance,
  AndroidVisibility,
  Notification,
} from '@notifee/react-native';
import {
  ADHAN_CHANNEL_ID,
  PRE_ADHAN_CHANNEL_ID,
  PRE_REMINDER_CHANNEL_ID,
  REMINDER_CHANNEL_ID,
  WIDGET_CHANNEL_ID,
  WIDGET_CHANNEL_NAME,
  WIDGET_NOTIFICATION_ID,
} from '@/constants/notification';
import {
  updateNotification,
  UpdateWidgetOptions,
} from '@/modules/notification_widget';
import {playAdhan, stopAdhan} from '@/services/azan_service';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {finishAndRemoveTask, isDndActive} from './modules/activity';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {Reminder, reminderSettings} from './store/reminder';
import {updateWidgets} from '@/tasks/update_widgets';
import {settings} from './store/settings';
import {SetPreAlarmTaskOptions} from './tasks/set_pre_alarm';
import {setReminders} from './tasks/set_reminder';

// TODO: remove when notifee has added FG_ALREADY_EXIST to their npm package
declare module '@notifee/react-native' {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  export enum EventType {
    FG_ALREADY_EXIST = 8,
  }
}

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
  if (notification?.android?.asForegroundService) {
    if (options?.playSound) {
      await stopAdhan().catch(console.error);
    }
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
        id: notification.id + '-remains',
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
    .then(
      notifs => notifs.filter(n => n.notification.id === targetAlarmNotifId)[0],
    )
    .catch(console.error);
  return getAlarmOptions(scheduledNotif?.notification);
}

export async function cancelNotifOnDismissed({
  detail,
  options,
  type,
}: NotifeeEvent) {
  if (type === EventType.TRIGGER_NOTIFICATION_CREATED) return;
  const {pressAction} = detail;

  if (type === EventType.DISMISSED || pressAction?.id === 'dismiss_alarm') {
    if (options?.date) {
      settings
        .getState()
        .saveTimestamp(options.notifId, options.date.valueOf());
    }
    await cancelAlarmNotif({notification: detail.notification, options});
  } else if (pressAction?.id === 'cancel_alarm') {
    // 'cancel_alarm' only exists on a pre-alarm notification
    const scheduledAlarmOptions = await getSecheduledAlarmOptions(
      (options as SetPreAlarmTaskOptions).targetAlarmNotifId,
    );
    if (scheduledAlarmOptions) {
      // save date of upcoming alarm to prevent setting alarm/prealarm before it
      settings
        .getState()
        .saveTimestamp(
          scheduledAlarmOptions.notifId,
          scheduledAlarmOptions.date.valueOf(),
        );

      await notifee.cancelNotification(scheduledAlarmOptions.notifId);
    }
  }
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
  bgEvent,
}: Omit<NotifeeEvent, 'options'> & {bgEvent: boolean}) {
  if (bgEvent) {
    bootstrap();
  }
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
      type === 8
    ) {
      if ((type === 8 || type === EventType.UNKNOWN) && notification) {
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
      if (options.playSound) {
        // even though we could not check options.playSound and
        // this would simply become a noop,
        // we have to reduce the cpu usage as much as we can
        // so we try not to hit third party code when not necessary
        await notifee
          .cancelNotification('pre-' + options.notifId)
          .catch(console.error);
      }
      if (channelId === ADHAN_CHANNEL_ID) {
        setNextAdhan();
        updateWidgets();
        setUpdateWidgetsAlarms();
      } else if (channelId === REMINDER_CHANNEL_ID) {
        if ((options as Pick<Reminder, 'once'>).once) {
          reminderSettings.getState().disableReminder({id: options.notifId});
        }
        await setReminders();
      }
    } else {
      await cancelNotifOnDismissed({type, detail, options});
    }
  }
}

export function setupNotifeeForegroundHandler() {
  return notifee.onForegroundEvent(({type, detail}) =>
    handleNotification({type, detail, bgEvent: true}),
  );
}

export function setupNotifeeHandlers() {
  notifee.onBackgroundEvent(({type, detail}) =>
    handleNotification({type, detail, bgEvent: true}),
  );

  notifee.registerForegroundService(async notification => {
    bootstrap();

    const channelId = notification?.android?.channelId;
    if (channelId === ADHAN_CHANNEL_ID || channelId === REMINDER_CHANNEL_ID) {
      const options = getAlarmOptions(notification);

      if (options?.playSound) {
        const canBypassDnd = (
          await notifee.getChannel(channelId).catch(console.error)
        )?.bypassDnd;

        const isDnd = await isDndActive();

        if (!isDnd || canBypassDnd) {
          return playAdhan(options.prayer)
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

    return Promise.resolve();
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

  return updateNotification({
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
