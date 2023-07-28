import {useEffect} from 'react';
import Orientation from 'react-native-orientation-locker';

export function useOrientationLock(lock: 'portrait' | 'landscape') {
  useEffect(() => {
    if (lock === 'portrait') {
      Orientation.lockToPortrait();
    } else {
      Orientation.lockToLandscape();
    }

    return () => {
      Orientation.unlockAllOrientations();
    };
  }, [lock]);
}
