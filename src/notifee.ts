import notifee, {EventType, EventDetail} from '@notifee/react-native';
import {BackHandler} from 'react-native';
import {ADHAN_NOTIFICATION_ID} from '@/constants/notification';
import {replace} from '@/navigation/root_navigation';
import {playAdhan, stopAdhan} from '@/services/azan_service';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';

export async function cancelAdhanNotif() {
  await stopAdhan();
  await notifee.cancelNotification(ADHAN_NOTIFICATION_ID);
  await notifee.stopForegroundService();
  replace('Home');
  await setNextAdhan();
}

export async function isAdhanPlaying() {
  return (
    (await notifee.getDisplayedNotifications()).filter(
      notif => notif.id === ADHAN_NOTIFICATION_ID,
    ).length > 0
  );
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
      const options = JSON.parse(
        notification.data?.options as string,
      ) as SetAlarmTaskOptions;
      if (options.playSound) {
        return playAdhan(options)
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
