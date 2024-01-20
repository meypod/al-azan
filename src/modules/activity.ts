import {NativeEventEmitter, NativeModule, NativeModules} from 'react-native';
import {loadLocale} from '@/i18n';
import {push, replace} from '@/navigation/root_navigation';
import {storage} from '@/store/mmkv';
import {settings} from '@/store/settings';

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

export enum VibrationMode {
  OFF = 0,
  ONCE = 1,
  CONTINUOUS = 2,
}

interface ActivityModuleInterface extends NativeModule {
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
  requestBatteryOptimizationSettings(): Promise<void>;
  isNotificationPolicyAccessGranted(): Promise<Boolean>;
  openDnDPermissionSettings(): Promise<Boolean>;
  /** resolve true if internet became available */
  openMobileDataSettings(): Promise<boolean>;
  saveJsonDocument(data: string, initialName: string): Promise<boolean>;
  vibrate(vibrationMode: VibrationMode): Promise<void>;
  vibrateStop(): Promise<void>;
}

const eventEmitter = new NativeEventEmitter(ActivityModule);

type EventListener = (
  eventType: 'demo_cmd',
  listener: (event: any) => void,
) => ReturnType<typeof eventEmitter.addListener>;

const addEventListener = eventEmitter.addListener.bind(
  eventEmitter,
) as EventListener;

export function handleDemoCommands() {
  addEventListener('demo_cmd', (args: Record<string, string>) => {
    if (args.command) {
      console.log(args);
      switch (args.command) {
        case 'lang':
          settings.setState({
            SELECTED_LOCALE: args.lang === 'en-US' ? 'en' : args.lang,
          });
          loadLocale(args.lang);
          // allow some time for forceRTL to work
          setTimeout(restart, 300);
          break;
        case 'set': {
          switch (args.store) {
            case 'settings':
              if (args.json) {
                settings.setState({
                  [args.key]: JSON.parse(args.value),
                });
              } else {
                settings.setState({
                  [args.key]: args.value,
                });
              }
              break;
            case 'mmkv':
              storage.set(args.key, args.value);
              break;
          }
          break;
        }
        case 'restart':
          restart();
          break;
        case 'navigate': {
          const params = Object.keys(args)
            .filter(k => !['command', 'type'].includes(k))
            .reduce((accumulator, curr) => {
              accumulator[curr] = args[curr];
              return accumulator;
            }, {} as Record<string, string>);
          if (args.type === 'replace') {
            replace(args.screen, params);
          } else {
            push(args.screen, params);
          }
          break;
        }
      }
    }
  });
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
export const vibrate = ActivityModule.vibrate;
export const vibrateStop = ActivityModule.vibrateStop;
export const requestBatteryOptimizationSettings =
  ActivityModule.requestBatteryOptimizationSettings;
export const isNotificationPolicyAccessGranted =
  ActivityModule.isNotificationPolicyAccessGranted;
export const openDnDPermissionSettings =
  ActivityModule.openDnDPermissionSettings;

export default ActivityModule;
