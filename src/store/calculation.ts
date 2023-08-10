import {
  Madhab,
  MidnightMethod,
  PolarCircleResolution,
  Shafaq,
  Rounding,
} from 'adhan-extended';
import {produce} from 'immer';
import {useCallback} from 'react';
import {useStore} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import {createStore} from 'zustand/vanilla';
import {clearCache} from './adhan_calc_cache';
import {alarmSettings, AlarmSettingsStore} from './alarm';
import {zustandStorage} from './mmkv';
import {settings} from './settings';
import {Prayer} from '@/adhan';
import type {CityInfo, CountryInfo} from '@/utils/geonames';

export const CALC_SETTINGS_STORAGE_KEY = 'CALC_SETTINGS_STORAGE';

export const ADHAN_NOTIFICATION_SUFFIX = '_NOTIFY';
export const ADHAN_SOUND_SUFFIX = '_SOUND';
export const ADHAN_ADJUSTMENT_SUFFIX = '_ADJUSTMENT';

export type LocationDetail = {
  lat?: number;
  long?: number;
  city?: CityInfo;
  country?: CountryInfo;
  /** available on `FavoriteLocation`s */
  label?: string;
};

export function getPrayerAdjustmentSettingKey(
  prayer: Prayer,
): keyof CalcSettingsStore {
  return (prayer.toUpperCase() +
    ADHAN_ADJUSTMENT_SUFFIX) as keyof CalcSettingsStore;
}

export type CalcSettingsStore = {
  LOCATION: LocationDetail | undefined;
  CALCULATION_METHOD_KEY: string | undefined;
  HIGH_LATITUDE_RULE: string | undefined;
  ASR_CALCULATION: string;
  SHAFAQ: string;
  POLAR_RESOLUTION: string;
  MIDNIGHT_METHOD: MidnightMethod;
  ROUNDING_METHOD: (typeof Rounding)[keyof typeof Rounding] | undefined;
  // Parameters override
  FAJR_ANGLE_OVERRIDE: undefined | number;
  ISHA_ANGLE_OVERRIDE: undefined | number;
  MAGHRIB_ANGLE_OVERRIDE: undefined | number;
  ISHA_INTERVAL_OVERRIDE: undefined | number;

  // prayer adjustment settings
  FAJR_ADJUSTMENT: number;
  SUNRISE_ADJUSTMENT: number;
  DHUHR_ADJUSTMENT: number;
  ASR_ADJUSTMENT: number;
  SUNSET_ADJUSTMENT: number;
  MAGHRIB_ADJUSTMENT: number;
  ISHA_ADJUSTMENT: number;
  MIDNIGHT_ADJUSTMENT: number;
  // calendar
  HIJRI_DATE_ADJUSTMENT: number;

  computed: {
    isCalcParamsModified: boolean;
  };

  setSetting: <T extends keyof CalcSettingsStore>(
    key: T,
    val: CalcSettingsStore[T],
  ) => void;
  removeSetting: (key: keyof CalcSettingsStore) => () => void;
};

const invalidKeys = ['setSetting', 'removeSetting', 'computed'];

export const calcSettings = createStore<CalcSettingsStore>()(
  persist(
    (set, get) => ({
      LOCATION_LAT: undefined,
      LOCATION_LONG: undefined,
      LOCATION: undefined,
      CALCULATION_METHOD_KEY: undefined,
      HIGH_LATITUDE_RULE: undefined,
      ASR_CALCULATION: Madhab.Shafi,
      SHAFAQ: Shafaq.General,
      POLAR_RESOLUTION: PolarCircleResolution.Unresolved,
      MIDNIGHT_METHOD: MidnightMethod.SunsetToFajr,
      ROUNDING_METHOD: undefined,
      // Parameters override
      FAJR_ANGLE_OVERRIDE: undefined,
      ISHA_ANGLE_OVERRIDE: undefined,
      MAGHRIB_ANGLE_OVERRIDE: undefined,
      ISHA_INTERVAL_OVERRIDE: undefined,

      FAJR_ADJUSTMENT: 0,
      SUNRISE_ADJUSTMENT: 0,
      DHUHR_ADJUSTMENT: 0,
      ASR_ADJUSTMENT: 0,
      SUNSET_ADJUSTMENT: 0,
      MAGHRIB_ADJUSTMENT: 0,
      ISHA_ADJUSTMENT: 0,
      MIDNIGHT_ADJUSTMENT: 0,
      // calendar
      HIJRI_DATE_ADJUSTMENT: 0,

      computed: {
        get isCalcParamsModified() {
          const state = get();
          return (
            [
              state.FAJR_ANGLE_OVERRIDE,
              state.ISHA_ANGLE_OVERRIDE,
              state.MAGHRIB_ANGLE_OVERRIDE,
              state.ISHA_INTERVAL_OVERRIDE,
            ].findIndex(p => typeof p !== 'undefined') !== -1
          );
        },
      },

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
      version: 6,
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
          case 3:
            if (!(persistedState as CalcSettingsStore).MIDNIGHT_METHOD) {
              (persistedState as CalcSettingsStore).MIDNIGHT_METHOD =
                MidnightMethod.SunsetToFajr;
            }
          case 4:
            if (
              typeof (persistedState as CalcSettingsStore)
                .MIDNIGHT_ADJUSTMENT === 'undefined'
            ) {
              (persistedState as CalcSettingsStore).MIDNIGHT_ADJUSTMENT = 0;
            }
            if (
              typeof (persistedState as CalcSettingsStore)
                .HIJRI_DATE_ADJUSTMENT === 'undefined'
            ) {
              (persistedState as CalcSettingsStore).HIJRI_DATE_ADJUSTMENT = 0;
            }
          case 5: {
            if (!(persistedState as any).LOCATION) {
              const s = settings.getState();
              (persistedState as CalcSettingsStore).LOCATION = {
                city: (s as any).LOCATION_CITY,
                country: (s as any).LOCATION_COUNTRY,
                lat: (persistedState as any).LOCATION_LAT,
                long: (persistedState as any).LOCATION_LONG,
              };
            }
          }
          case 6:
            if (
              ![
                MidnightMethod.SunsetToFajr,
                MidnightMethod.SunsetToSunrise,
              ].includes((persistedState as CalcSettingsStore).MIDNIGHT_METHOD)
            ) {
              (persistedState as CalcSettingsStore).MIDNIGHT_METHOD =
                MidnightMethod.SunsetToFajr;
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
  const state = useStore(calcSettings, s => s[key]);
  const setSetting = useStore(calcSettings, s => s.setSetting);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCallback = useCallback(
    (val: CalcSettingsStore[T]) => setSetting(key, val),
    [key, setSetting],
  );
  return [state, setCallback] as [
    CalcSettingsStore[T],
    (val: CalcSettingsStore[T]) => void,
  ];
}
