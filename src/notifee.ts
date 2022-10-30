import notifee, {
  EventType,
  EventDetail,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import {BackHandler} from 'react-native';
import {bootstrap} from '@/bootstrap';
import {
  ADHAN_NOTIFICATION_ID,
  PRE_ADHAN_NOTIFICATION_ID,
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
import {settings} from '@/store/settings';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {setUpdateWidgetsAlarms} from '@/tasks/set_update_widgets_alarms';
import {updateWidgets} from '@/tasks/update_widgets';

export async function cancelAdhanNotif() {
  await stopAdhan().catch(console.error);
  replace('Home');
  await notifee.cancelDisplayedNotification(ADHAN_NOTIFICATION_ID);
  await notifee.stopForegroundService();
}

export async function isAdhanPlaying() {
  return (
    (await notifee.getDisplayedNotifications()).filter(
      notif => notif.id === ADHAN_NOTIFICATION_ID,
    ).length > 0
  );
}

export async function getSecheduledAdhanNotificationOptions() {
  const scheduledNotif = await notifee
    .getTriggerNotifications()
    .then(
      notifs =>
        notifs.filter(n => n.notification.id === ADHAN_NOTIFICATION_ID)[0],
    )
    .catch(console.error);
  if (!scheduledNotif) return;

  const options = JSON.parse(
    scheduledNotif?.notification?.data?.options as string,
  ) as SetAlarmTaskOptions;

  if (options) {
    options.date = new Date(options.date);
  } else {
    return;
  }

  return options;
}

export async function cancelAdhanNotifOnDismissed(
  type: EventType,
  detail: EventDetail,
) {
  if (type === EventType.TRIGGER_NOTIFICATION_CREATED) return;
  const {notification, pressAction} = detail;
  if (notification?.id === ADHAN_NOTIFICATION_ID) {
    if (type === EventType.DISMISSED || pressAction?.id === 'dismiss') {
      await cancelAdhanNotif();
    }
  } else if (
    notification?.id === PRE_ADHAN_NOTIFICATION_ID &&
    pressAction?.id === 'cancel_adhan'
  ) {
    const options = await getSecheduledAdhanNotificationOptions();
    if (options) {
      // save date of upcoming adhan to prevent setting alarm/prealarm before it
      settings.setState({DISMISSED_ALARM_TIMESTAMP: options.date.valueOf()});
      // cancel upcoming notification
      await notifee.cancelNotification(ADHAN_NOTIFICATION_ID);
      // re-set the adhan notification alarm
      setNextAdhan({
        fromDate: new Date(new Date(options.date).valueOf() + 10000),
      });
      setUpdateWidgetsAlarms();
    }
  }
}

export function openFullscreenAlarmIfNeeded(
  type: EventType,
  detail: EventDetail,
) {
  if (
    (type === EventType.PRESS || type === EventType.DELIVERED) &&
    detail.notification?.id === ADHAN_NOTIFICATION_ID
  ) {
    const options = JSON.parse(
      detail.notification.data?.options as string,
    ) as SetAlarmTaskOptions;
    if (options.playSound && options.fullScreen) {
      replace('FullscreenAlarm', {
        options: detail.notification.data?.options,
      });
    }
  }
}

export function setupNotifeeHandlers() {
  notifee.onBackgroundEvent(async ({type, detail}) => {
    await bootstrap();
    if (
      type === EventType.DELIVERED &&
      detail.notification?.id === ADHAN_NOTIFICATION_ID
    ) {
      setNextAdhan();
      updateWidgets();
      setUpdateWidgetsAlarms();
    }
    openFullscreenAlarmIfNeeded(type, detail);
    await cancelAdhanNotifOnDismissed(type, detail);
  });

  notifee.registerForegroundService(async notification => {
    await bootstrap();
    if (notification.id === ADHAN_NOTIFICATION_ID) {
      notifee.cancelNotification(PRE_ADHAN_NOTIFICATION_ID);
      const options = JSON.parse(
        notification.data?.options as string,
      ) as SetAlarmTaskOptions;

      if (options.playSound) {
        return playAdhan(options.prayer)
          .then(() => cancelAdhanNotif())
          .then(() => BackHandler.exitApp());
      }
    }
    return Promise.resolve();
  });
}

export function setupNotifeeForegroundHandler() {
  return notifee.onForegroundEvent(({type, detail}) => {
    openFullscreenAlarmIfNeeded(type, detail);
    cancelAdhanNotifOnDismissed(type, detail);
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
