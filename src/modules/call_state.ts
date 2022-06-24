import {NativeModules} from 'react-native';

const CallStateModule = (
  NativeModules.CallStateModule
    ? NativeModules.CallStateModule
    : new Proxy(
        {},
        {
          get() {
            throw new Error('error while linking CallState module');
          },
        },
      )
) as CallStateModuleInterface;

interface CallStateModuleInterface {
  isCallActive(): Promise<boolean>;
}

export const isCallActive = CallStateModule.isCallActive;

export default CallStateModule as CallStateModuleInterface;
