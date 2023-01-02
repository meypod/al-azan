import notifee, {
  EventType,
  EventDetail,
  AndroidImportance,
  AndroidVisibility,
  Notification,
} from '@notifee/react-native';
import {BackHandler} from 'react-native';
import {reminderSettings} from './store/reminder';
import {settings} from './store/settings';
import {SetPreAlarmTaskOptions} from './tasks/set_pre_alarm';
import {setReminders} from './tasks/set_reminder';
import {bootstrap} from '@/bootstrap';
import {
  ADHAN_CHANNEL_ID,
  REMINDER_CHANNEL_ID,
  WIDGET_CHANNEL_ID,
  WIDGET_CHANNEL_NAME,
  WIDGET_NOTIFICATION_ID,
} from '@/constants/notification';
import {
  updateNotification,
  UpdateWidgetOptions,
} from '@/modules/notification_widget';
import {replace} from '@/navigation/root_navigation';
import {playAdhan, stopAdhan} from '@/services/azan_service';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

export async function cancelAlarmNotif(options?: SetAlarmTaskOptions) {
  if (options?.playSound) {
    await stopAdhan().catch(console.error);
    await notifee.stopForegroundService();
    replace('Home');
  }
  if (options?.notifId) {
    await notifee.cancelDisplayedNotification(options.notifId);
  }
}

export function getAlarmOptions(notification: Notification | undefined) {
  if (!notification) return;

  const options = JSON.parse(
    notification.data?.options as string,
  ) as SetAlarmTaskOptions;

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

export type NotifeeEvent = {
  type: EventType;
  detail: EventDetail;
  options: SetAlarmTaskOptions | undefined;
};
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
    await cancelAlarmNotif(options);
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

export function openFullscreenAlarmIfNeeded({
  detail,
  options,
  type,
}: NotifeeEvent) {
  if (
    (type === EventType.PRESS || type === EventType.DELIVERED) &&
    options?.playSound
  ) {
    replace('FullscreenAlarm', {
      options: detail.notification?.data?.options,
    });
  }
}

async function handleNotification({
  detail,
  type,
  bgEvent,
}: Omit<NotifeeEvent, 'options'> & {bgEvent: boolean}) {
  if (bgEvent) {
    await bootstrap();
  }
  const {notification} = detail;
  const channelId = notification?.android?.channelId;

  if (channelId === ADHAN_CHANNEL_ID || channelId === REMINDER_CHANNEL_ID) {
    const options = getAlarmOptions(notification);

    if (type === EventType.DELIVERED) {
      if (channelId === ADHAN_CHANNEL_ID) {
        setNextAdhan();
        updateWidgets();
        setUpdateWidgetsAlarms();
      } else if (channelId === REMINDER_CHANNEL_ID) {
        if (notification?.id) {
          reminderSettings.getState().disableReminder({id: notification.id});
        }

        await setReminders();
      }
    } else {
      await cancelNotifOnDismissed({type, detail, options});
    }
    openFullscreenAlarmIfNeeded({type, detail, options});
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
    await bootstrap();

    const channelId = notification?.android?.channelId;
    if (channelId === ADHAN_CHANNEL_ID || channelId === REMINDER_CHANNEL_ID) {
      const options = getAlarmOptions(notification);

      await notifee
        .cancelNotification('pre-' + notification.id)
        .catch(console.error);

      if (options?.playSound) {
        return playAdhan(options.prayer)
          .then(() => cancelAlarmNotif(options))
          .then(() => BackHandler.exitApp());
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
