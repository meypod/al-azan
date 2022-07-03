import {NativeModules} from 'react-native';

const NotificationWidgetModule = (
  NativeModules.NotificationWidgetModule
    ? NativeModules.NotificationWidgetModule
    : new Proxy(
        {},
        {
          get() {
            throw new Error('error while linking restart module');
          },
        },
      )
) as NotificationWidgetModuleInterface;

export type UpdateWidgetOptions = {
  channelId: string;
  notificationId: string;
  hijriDate: string;
  dayAndMonth: string;
  prayers: Array<[prayerName: string, prayerTime: string, isActive: Boolean]>;
};

interface NotificationWidgetModuleInterface {
  updateNotification(options: UpdateWidgetOptions): Promise<void>;
}

export const updateNotification = NotificationWidgetModule.updateNotification;

export default NotificationWidgetModule as NotificationWidgetModuleInterface;
