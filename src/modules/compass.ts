import {useEffect, useRef, useState} from 'react';
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

export const setCompassLocation = CompassModule.setLocation as (
  latitude: Number,
  longitude: Number,
  altitude: Number,
) => void;

export const setUpdateRate = CompassModule.setUpdateRate as (
  rateInMs: Number,
) => void;

export function useCompassHeading() {
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    const sub = addEventListener('heading', (degrees: number) => {
      setHeading(degrees);
    });
    return () => sub.remove();
  }, []);

  return heading;
}

export function useCompassHeadingRef() {
  const heading = useRef(0);

  useEffect(() => {
    const sub = addEventListener('heading', (degrees: number) => {
      heading.current = degrees;
    });
    return () => sub.remove();
  }, []);

  return heading;
}

export enum AccuracyLevel {
  SENSOR_STATUS_SENSOR_NOT_FOUND = -3,
  SENSOR_STATUS_SENSOR_NOT_WORKING = -2,
  SENSOR_STATUS_NO_CONTACT = -1,
  SENSOR_STATUS_UNRELIABLE = 0,
  SENSOR_STATUS_ACCURACY_LOW = 1,
  SENSOR_STATUS_ACCURACY_MEDIUM = 2,
  SENSOR_STATUS_ACCURACY_HIGH = 3,
}

export function useCompassAccuracy() {
  const [accuracy, setAccuracy] = useState(
    AccuracyLevel.SENSOR_STATUS_UNRELIABLE,
  );
  useEffect(() => {
    const sub = addEventListener('accuracyChanged', (level: AccuracyLevel) => {
      setAccuracy(level);
    });
    return () => sub.remove();
  }, []);

  return accuracy;
}

export function isCompassAvailable() {
  return new Promise(resolve => {
    const sub = addEventListener('accuracyChanged', (level: AccuracyLevel) => {
      sub.remove();
      resolve(level);
    });
  });
}

export default {
  addListener: addEventListener,
  setLocation: setCompassLocation,
  useCompassHeading,
  useCompassHeadingRef,
  setUpdateRate,
  isCompassAvailable,
};
