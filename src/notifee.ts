import {i18n} from '@lingui/core';
import notifee, {
  EventType,
  EventDetail,
  AndroidImportance,
  AndroidVisibility,
} from '@notifee/react-native';
import {difference} from 'lodash';
import {BackHandler} from 'react-native';
import {getPrayerTimes, PrayersInOrder, prayerTranslations} from '@/adhan';
import {getActivePrayer} from '@/adhan/utils';
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
import {settings, waitTillHydration} from '@/store/settings';
import {SetAlarmTaskOptions} from '@/tasks/set_alarm';
import {setNextAdhan} from '@/tasks/set_next_adhan';
import {updateWidget} from '@/tasks/update_widget';
import {getArabicDate, getDay, getMonthName, getTime24} from '@/utils/date';

export async function cancelAdhanNotif() {
  await stopAdhan();
  await notifee.cancelNotification(ADHAN_NOTIFICATION_ID);
  await notifee.stopForegroundService();
  replace('Home');
  await waitTillHydration();
  setNextAdhan();
  updateWidget();
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
    if (pressAction?.id === 'cancel_adhan' && type !== EventType.DISMISSED) {
      await waitTillHydration();
      const options = await getSecheduledAdhanNotificationOptions();
      if (options) {
        // save date of upcoming adhan to prevent setting alarm/prealarm before it
        settings.setState({DISMISSED_ALARM_TIMESTAMP: options.date.valueOf()});
        // cancel upcoming notification
        await notifee.cancelNotification(ADHAN_NOTIFICATION_ID);
        // re-set the adhan notification alarm
        setNextAdhan(new Date(new Date(options.date).valueOf() + 10000));
      }
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
          .then(playedSuccessfully => {
            if (playedSuccessfully) {
              cancelAdhanNotif();
            }
          })
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

export type updateWidgetOptions = Pick<
  UpdateWidgetOptions,
  'dayAndMonth' | 'hijriDate' | 'prayers'
>;

export async function updatePermanentNotifWidget() {
  const channelId = await notifee.createChannel({
    id: WIDGET_CHANNEL_ID,
    name: WIDGET_CHANNEL_NAME,
    importance: AndroidImportance.LOW,
    visibility: AndroidVisibility.PUBLIC,
  });

  const now = new Date();

  const prayerTimes = getPrayerTimes(now);
  if (!prayerTimes)
    throw new Error(
      'notification widget: prayer times for given date is undefined',
    );
  const hiddenPrayers = settings.getState().HIDDEN_WIDGET_PRAYERS;

  const visiblePrayerTimes = difference(PrayersInOrder, hiddenPrayers);

  const activePrayer = getActivePrayer(prayerTimes, visiblePrayerTimes);

  const prayers = visiblePrayerTimes.map(
    p =>
      [
        i18n._(prayerTranslations[p.toLowerCase()]),
        getTime24(prayerTimes[p]),
        p === activePrayer,
      ] as [prayerName: string, prayerTime: string, isActive: Boolean],
  );

  updateNotification({
    dayAndMonth: getMonthName(new Date(now)) + ', ' + getDay(new Date()),
    hijriDate: getArabicDate(new Date(now)),
    prayers,
    channelId,
    notificationId: WIDGET_NOTIFICATION_ID,
  }).catch(console.error);
}

export function cancelPermanentNotifWidget() {
  return notifee.cancelDisplayedNotification(WIDGET_NOTIFICATION_ID);
}
