import {NativeEventEmitter, NativeModules} from 'react-native';

const CompassModule = NativeModules.CompassModule
  ? NativeModules.CompassModule
  : new Proxy(
      {},
      {
        get() {
          if (process?.env?.JEST_WORKER_ID === undefined) {
            throw new Error('error while linking compass module');
          }
        },
      },
    );

const eventEmitter = new NativeEventEmitter(CompassModule);

type EventListener = (
  eventType: 'accuracyChanged' | 'heading',
  listener: (event: any) => void,
) => ReturnType<typeof eventEmitter.addListener>;

const addEventListener = eventEmitter.addListener.bind(
  eventEmitter,
) as EventListener;

const setLocation = CompassModule.setLocation as (
  latitude: Number,
  longitude: Number,
  altitude: Number,
) => void;

export default {
  addListener: addEventListener,
  setLocation,
};
