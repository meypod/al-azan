import {NativeModules} from 'react-native';

const RestartModule = (
  NativeModules.RestartModule
    ? NativeModules.RestartModule
    : new Proxy(
        {},
        {
          get() {
            if (process?.env?.JEST_WORKER_ID === undefined) {
              throw new Error('error while linking restart module');
            }
          },
        },
      )
) as RestartModuleInterface;

interface RestartModuleInterface {
  restart(): void;
}

export const restart = RestartModule.restart;

export default RestartModule as RestartModuleInterface;
