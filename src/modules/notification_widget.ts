import {NativeModules} from 'react-native';

const NotificationWidgetModule = (
  NativeModules.NotificationWidgetModule
    ? NativeModules.NotificationWidgetModule
    : new Proxy(
        {},
        {
          get() {
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking notification widget module');
            }
          },
        },
      )
) as NotificationWidgetModuleInterface;

export type UpdateWidgetOptions = {
  channelId: string;
  notificationId: string;
  topStartText: string;
  topEndText: string;
  adaptiveTheme: boolean;
  showCountdown: boolean;
  countdownLabel: string | null;
  countdownBase: string | null;
  prayers: Array<[prayerName: string, prayerTime: string, isActive: Boolean]>;
};

interface NotificationWidgetModuleInterface {
  updateNotification(options: UpdateWidgetOptions): Promise<void>;
}

export const updateNotification = NotificationWidgetModule.updateNotification;

export default NotificationWidgetModule as NotificationWidgetModuleInterface;
