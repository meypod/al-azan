import {AppRegistry, NativeModules, Platform} from 'react-native';

const ScreenWidgetModule = (
  NativeModules.ScreenWidgetModule
    ? NativeModules.ScreenWidgetModule
    : new Proxy(
        {},
        {
          get() {
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking screen widget module');
            }
          },
        },
      )
) as ScreenWidgetModuleInterface;

let backgroundEventHandler: () => Promise<void>;

if (Platform.OS === 'android') {
  AppRegistry.registerHeadlessTask('update_screen_widget_task', () => {
    if (!backgroundEventHandler) {
      console.warn(
        '[screen widget module] no registered background service has been set for handling a screen widget update.',
      );
      return () => Promise.resolve();
    }

    return (): Promise<void> => backgroundEventHandler();
  });
}

export type UpdateWidgetOptions = {
  topStartText: string;
  topEndText: string;
  prayers: Array<[prayerName: string, prayerTime: string, isActive: Boolean]>;
  adaptiveTheme: boolean;
  showCountdown: boolean;
  countdownLabel: string | null;
  countdownBase: string | null;
};

interface ScreenWidgetModuleInterface {
  updateScreenWidget(options: UpdateWidgetOptions): Promise<void>;
}

export const updateScreenWidget = ScreenWidgetModule.updateScreenWidget;

export const onUpdateScreenWidgetRequested = (handler: () => Promise<void>) => {
  if (typeof handler !== 'function') {
    throw new Error(
      "[screen widget module] onUpdateScreenWidgetRequested(*) 'handler' expected a function.",
    );
  }
  backgroundEventHandler = handler;
};
