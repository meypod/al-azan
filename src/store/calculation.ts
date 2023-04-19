import {Madhab, PolarCircleResolution, Shafaq} from 'adhan';
import {produce} from 'immer';
import {useCallback} from 'react';
import {useStore} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {createStore} from 'zustand/vanilla';
import {clearCache} from './adhan_calc_cache';
import {alarmSettings, AlarmSettingsStore} from './alarm';
import {zustandStorage} from './mmkv';
import {Prayer} from '@/adhan';

export const CALC_SETTINGS_STORAGE_KEY = 'CALC_SETTINGS_STORAGE';

export const ADHAN_NOTIFICATION_SUFFIX = '_NOTIFY';
export const ADHAN_SOUND_SUFFIX = '_SOUND';
export const ADHAN_ADJUSTMENT_SUFFIX = '_ADJUSTMENT';

export function getPrayerAdjustmentSettingKey(
  prayer: Prayer,
): keyof CalcSettingsStore {
  return (prayer.toUpperCase() +
    ADHAN_ADJUSTMENT_SUFFIX) as keyof CalcSettingsStore;
}

export type CalcSettingsStore = {
  LOCATION_LAT: number | undefined;
  LOCATION_LONG: number | undefined;
  CALCULATION_METHOD_KEY: string | undefined;
  HIGH_LATITUDE_RULE: string | undefined;
  ASR_CALCULATION: string;
  SHAFAQ: string;
  POLAR_RESOLUTION: string;

  // prayer adjustment settings
  FAJR_ADJUSTMENT: number;
  SUNRISE_ADJUSTMENT: number;
  DHUHR_ADJUSTMENT: number;
  ASR_ADJUSTMENT: number;
  SUNSET_ADJUSTMENT: number;
  MAGHRIB_ADJUSTMENT: number;
  ISHA_ADJUSTMENT: number;

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

export const calcSettings = createStore<CalcSettingsStore>()(
  persist(
    set => ({
      LOCATION_LAT: undefined,
      LOCATION_LONG: undefined,
      CALCULATION_METHOD_KEY: undefined,
      HIGH_LATITUDE_RULE: undefined,
      ASR_CALCULATION: Madhab.Shafi,
      SHAFAQ: Shafaq.General,
      POLAR_RESOLUTION: PolarCircleResolution.Unresolved,

      FAJR_ADJUSTMENT: 0,
      SUNRISE_ADJUSTMENT: 0,
      DHUHR_ADJUSTMENT: 0,
      ASR_ADJUSTMENT: 0,
      SUNSET_ADJUSTMENT: 0,
      MAGHRIB_ADJUSTMENT: 0,
      ISHA_ADJUSTMENT: 0,

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
      storage: createJSONStorage(() => zustandStorage),
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
      version: 3,
      migrate: (persistedState, version) => {
        /* eslint-disable no-fallthrough */
        // fall through cases is exactly the use case for migration.
        switch (version) {
          case 0:
            // added method adjustments field in version 1
            (persistedState as CalcSettingsStore).FAJR_ADJUSTMENT = 0;
            (persistedState as CalcSettingsStore).SUNRISE_ADJUSTMENT = 0;
            (persistedState as CalcSettingsStore).DHUHR_ADJUSTMENT = 0;
            (persistedState as CalcSettingsStore).ASR_ADJUSTMENT = 0;
            (persistedState as CalcSettingsStore).SUNSET_ADJUSTMENT = 0;
            (persistedState as CalcSettingsStore).MAGHRIB_ADJUSTMENT = 0;
            (persistedState as CalcSettingsStore).ISHA_ADJUSTMENT = 0;
          case 1:
            // moved all notification related keys to alarm settings
            for (const key in persistedState as CalcSettingsStore) {
              if (key.endsWith('_NOTIFY') || key.endsWith('_SOUND')) {
                alarmSettings.setState({
                  [key]: (persistedState as CalcSettingsStore)[
                    key as keyof CalcSettingsStore
                  ] as keyof AlarmSettingsStore,
                });
                delete (persistedState as any)[key];
              }
            }
          case 2:
            // a cache reset force for Radaman fix for Umm al-Qura University method
            if (
              (persistedState as CalcSettingsStore).CALCULATION_METHOD_KEY ===
              'UmmAlQura'
            ) {
              clearCache();
            }
            break;
        }
        /* eslint-enable no-fallthrough */
        return persistedState as CalcSettingsStore;
      },
    },
  ),
);

export function useCalcSettings<T extends keyof CalcSettingsStore>(key: T) {
  const state = useStore(calcSettings, s => s[key], shallow);
  const setterCurry = useStore(calcSettings, s => s.setSettingCurry, shallow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCallback = useCallback(setterCurry(key), [key]);
  return [state, setCallback] as [
    CalcSettingsStore[T],
    (val: CalcSettingsStore[T]) => void,
  ];
}
