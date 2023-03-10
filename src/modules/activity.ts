import {NativeModules} from 'react-native';

const ActivityModule = (
  NativeModules.ActivityModule
    ? NativeModules.ActivityModule
    : new Proxy(
        {},
        {
          get() {
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking activity module');
            }
          },
        },
      )
) as ActivityModuleInterface;

interface ActivityModuleInterface {
  restart(): Promise<void>;
  finish(): Promise<void>;
  finishAndRemoveTask(): Promise<void>;
  getActivityName(): Promise<string>;
  isDndActive(): Promise<boolean>;
  openApplicationSettings(): Promise<void>;
  isNetworkAvailable(): Promise<boolean>;
  isLocationEnabled(): Promise<boolean>;
  /** resolve true if high accuracy location was enabled */
  openLocationSettings(): Promise<boolean>;
  /** resolve true if internet became available */
  openMobileWifiSettings(): Promise<boolean>;
  /** resolve true if internet became available */
  openMobileDataSettings(): Promise<boolean>;
  saveJsonDocument(data: string, initialName: string): Promise<boolean>;
}

export const restart = ActivityModule.restart;
export const finish = ActivityModule.finish;
export const finishAndRemoveTask = ActivityModule.finishAndRemoveTask;
export const getActivityName = ActivityModule.getActivityName;
export const isDndActive = ActivityModule.isDndActive;
export const openApplicationSettings = ActivityModule.openApplicationSettings;
export const isNetworkAvailable = ActivityModule.isNetworkAvailable;
export const isLocationEnabled = ActivityModule.isLocationEnabled;
export const openLocationSettings = ActivityModule.openLocationSettings;
export const openMobileWifiSettings = ActivityModule.openMobileWifiSettings;
export const openMobileDataSettings = ActivityModule.openMobileDataSettings;
export const saveJsonDocument = ActivityModule.saveJsonDocument;

export default ActivityModule;
