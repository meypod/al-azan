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
  ADHAN_NOTIFICATION_ID,
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
  }
  replace('Home');
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

export async function cancelNotifOnDismissed(
  type: EventType,
  detail: EventDetail,
) {
  if (type === EventType.TRIGGER_NOTIFICATION_CREATED) return;
  const {notification, pressAction} = detail;
  if (type === EventType.DISMISSED || pressAction?.id === 'dismiss_alarm') {
    const options = getAlarmOptions(notification);
    if (options?.date) {
      settings
        .getState()
        .saveTimestamp(options.notifId, options.date.valueOf());
    }
    await cancelAlarmNotif(options);
  } else if (pressAction?.id === 'cancel_alarm') {
    // we are pressing an action from pre-alarm notification
    const preAlarmOptions = getAlarmOptions(
      notification,
    ) as SetPreAlarmTaskOptions;
    const options = await getSecheduledAlarmOptions(
      preAlarmOptions.targetAlarmNotifId,
    );
    if (options) {
      // save date of upcoming alarm to prevent setting alarm/prealarm before it
      settings
        .getState()
        .saveTimestamp(options.notifId, options.date.valueOf());

      await notifee.cancelNotification(options.notifId);
    }
  }
}

export function openFullscreenAlarmIfNeeded(
  type: EventType,
  detail: EventDetail,
) {
  const options = JSON.parse(
    detail.notification?.data?.options as string,
  ) as SetAlarmTaskOptions;
  if (
    (type === EventType.PRESS || type === EventType.DELIVERED) &&
    options.playSound
  ) {
    replace('FullscreenAlarm', {
      options: detail.notification?.data?.options,
    });
  }
}

export function setupNotifeeHandlers() {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    await bootstrap();
    if (type === EventType.DELIVERED) {
      if (detail.notification?.id === ADHAN_NOTIFICATION_ID) {
        setNextAdhan();
        updateWidgets();
        setUpdateWidgetsAlarms();
      } else if (
        detail.notification?.android?.channelId === REMINDER_CHANNEL_ID
      ) {
        if (detail.notification?.id) {
          reminderSettings
            .getState()
            .disableReminder({id: detail.notification.id});
        }

        await setReminders();
      }
    } else {
      await cancelNotifOnDismissed(type, detail);
    }
    openFullscreenAlarmIfNeeded(type, detail);
  });

  notifee.registerForegroundService(async notification => {
    await bootstrap();

    const options = JSON.parse(
      notification.data?.options as string,
    ) as SetAlarmTaskOptions;

    await notifee
      .cancelNotification('pre-' + notification.id)
      .catch(console.error);

    if (options.playSound) {
      return playAdhan(options.prayer)
        .then(() => cancelAlarmNotif(options))
        .then(() => BackHandler.exitApp());
    }
    return Promise.resolve();
  });
}

export function setupNotifeeForegroundHandler() {
  return notifee.onForegroundEvent(({type, detail}) => {
    openFullscreenAlarmIfNeeded(type, detail);
    cancelNotifOnDismissed(type, detail);
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
