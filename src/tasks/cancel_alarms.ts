import notifee from '@notifee/react-native';
import {
  ADHAN_NOTIFICATION_ID,
  PRE_ADHAN_NOTIFICATION_ID,
} from '@/constants/notification';

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

export function cancelAdhanAlarms() {
  return Promise.all([cancelPreAdhanNotification(), cancelAdhanNotification()]);
}
