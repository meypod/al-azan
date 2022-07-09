import {Madhab, PolarCircleResolution, Shafaq} from 'adhan';
import {produce} from 'immer';
// eslint-disable-next-line
import ReactNativeBlobUtil from 'react-native-blob-util';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import createVanilla from 'zustand/vanilla';
import {zustandStorage} from './mmkv';
import {Prayer, PrayersInOrder} from '@/adhan';

const CALC_SETTINGS_STORAGE_KEY = 'CALC_SETTINGS_STORAGE';

export const ADHAN_NOTIFICATION_SUFFIX = '_NOTIFY';
export const ADHAN_SOUND_SUFFIX = '_SOUND';

export function getAdhanSettingKey(
  prayer: Prayer,
  k: 'sound' | 'notify',
): keyof CalcSettingsStore {
  if (k === 'notify') {
    return (prayer.toUpperCase() +
      ADHAN_NOTIFICATION_SUFFIX) as keyof CalcSettingsStore;
  } else {
    return (prayer.toUpperCase() +
      ADHAN_SOUND_SUFFIX) as keyof CalcSettingsStore;
  }
}

type CalcSettingsStore = {
  LOCATION_LAT: number | undefined;
  LOCATION_LONG: number | undefined;
  CALCULATION_METHOD_KEY: string | undefined;
  HIGH_LATITUDE_RULE: string | undefined;
  ASR_CALCULATION: string;
  SHAFAQ: string;
  POLAR_RESOLUTION: string;

  //prayer notification settings
  FAJR_NOTIFY?: boolean;
  SUNRISE_NOTIFY?: boolean;
  DHUHR_NOTIFY?: boolean;
  ASR_NOTIFY?: boolean;
  SUNSET_NOTIFY?: boolean;
  MAGHRIB_NOTIFY?: boolean;
  ISHA_NOTIFY?: boolean;
  MIDNIGHT_NOTIFY?: boolean;
  // prayer sound settings
  FAJR_SOUND?: boolean;
  SUNRISE_SOUND?: boolean;
  DHUHR_SOUND?: boolean;
  ASR_SOUND?: boolean;
  SUNSET_SOUND?: boolean;
  MAGHRIB_SOUND?: boolean;
  ISHA_SOUND?: boolean;
  MIDNIGHT_SOUND?: boolean;

  setSetting: <T extends keyof CalcSettingsStore>(
    key: T,
    val: CalcSettingsStore[T],
  ) => void;
  setSettingCurry: <T extends keyof CalcSettingsStore>(
    key: T,
  ) => (val: CalcSettingsStore[T]) => void;
  removeSetting: (key: keyof CalcSettingsStore) => () => void;
};

const invalidKeys = ['setSetting', 'setSettingCurry', 'removeSetting'];

export const calcSettings = createVanilla<CalcSettingsStore>()(
  persist(
    set => ({
      LOCATION_LAT: undefined,
      LOCATION_LONG: undefined,
      CALCULATION_METHOD_KEY: undefined,
      HIGH_LATITUDE_RULE: undefined,
      ASR_CALCULATION: Madhab.Shafi,
      SHAFAQ: Shafaq.General,
      POLAR_RESOLUTION: PolarCircleResolution.Unresolved,

      // general
      setSetting: <T extends keyof CalcSettingsStore>(
        key: T,
        val: CalcSettingsStore[T],
      ) =>
        set(
          produce<CalcSettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            draft[key] = val;
          }),
        ),
      setSettingCurry:
        <T extends keyof CalcSettingsStore>(key: T) =>
        (val: CalcSettingsStore[T]) =>
          set(
            produce<CalcSettingsStore>(draft => {
              if (invalidKeys.includes(key)) return;
              draft[key] = val;
            }),
          ),
      removeSetting: key => () =>
        set(
          produce<CalcSettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            delete draft[key];
          }),
        ),
    }),
    {
      name: CALC_SETTINGS_STORAGE_KEY,
      getStorage: () => zustandStorage,
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
    },
  ),
);

export const useCalcSettings = create(calcSettings);

export function useCalcSettingsHelper<T extends keyof CalcSettingsStore>(
  key: T,
) {
  return useCalcSettings(state => [state[key], state.setSettingCurry(key)]) as [
    CalcSettingsStore[T],
    (val: CalcSettingsStore[T]) => void,
  ];
}

export function hasAtLeastOneNotificationSetting() {
  for (let prayer of PrayersInOrder) {
    if (calcSettings.getState()[getAdhanSettingKey(prayer, 'notify')]) {
      return true;
    }
  }
  return false;
}
