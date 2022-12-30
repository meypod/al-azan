import notifee from '@notifee/react-native';
import {
  ADHAN_NOTIFICATION_ID,
  PRE_ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';
import {alarmSettings} from '@/store/alarm_settings';

function cancelPreAdhanNotification() {
  return notifee
    .cancelTriggerNotification(PRE_ADHAN_NOTIFICATION_ID)
    .catch(console.error);
}

function cancelAdhanNotification() {
  return notifee
    .cancelTriggerNotification(ADHAN_NOTIFICATION_ID)
    .catch(console.error);
}

function cancelReminders() {
  return notifee
    .cancelTriggerNotifications(
      alarmSettings.getState().REMINDERS.map(r => r.id),
    )
    .catch(console.error);
}

export function cancelAlarmsAndReminders() {
  return Promise.all([
    cancelPreAdhanNotification(),
    cancelAdhanNotification(),
    cancelReminders(),
  ]);
}
