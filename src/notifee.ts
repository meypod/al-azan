import notifee, {EventType, EventDetail} from '@notifee/react-native';
import {BackHandler} from 'react-native';
import {
  ADHAN_NOTIFICATION_ID,
  PRE_ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';
import {replace} from '@/navigation/root_navigation';
import {playAdhan, stopAdhan} from '@/services/azan_service';
import {waitTillHydration} from '@/store/settings';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {SetPreAlarmTaskOptions} from '@/tasks/set_pre_alarm';

export async function cancelAdhanNotif() {
  await stopAdhan();
  await notifee.cancelNotification(ADHAN_NOTIFICATION_ID);
  await notifee.stopForegroundService();
  replace('Home');
  await waitTillHydration();
  setNextAdhan();
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
    .catch(() => {});
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
  } else if (notification?.id === PRE_ADHAN_NOTIFICATION_ID) {
    if (pressAction?.id === 'dismiss') {
      // cancel upcoming notification
      await notifee.cancelNotification(ADHAN_NOTIFICATION_ID);
      const options = JSON.parse(
        notification.data?.options as string,
      ) as SetPreAlarmTaskOptions;
      await waitTillHydration();
      setNextAdhan(new Date(new Date(options.date).valueOf() + 10000));
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
    openFullscreenAlarmIfNeeded(type, detail);
    await cancelAdhanNotifOnDismissed(type, detail);
  });

  notifee.registerForegroundService(notification => {
    if (notification.id === ADHAN_NOTIFICATION_ID) {
      notifee.cancelNotification(PRE_ADHAN_NOTIFICATION_ID);
      const options = JSON.parse(
        notification.data?.options as string,
      ) as SetAlarmTaskOptions;
      if (options.playSound) {
        return playAdhan()
          .then(() => cancelAdhanNotif())
          .then(() => {
            BackHandler.exitApp();
          });
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
