import AsyncStorage from '@react-native-async-storage/async-storage';
import {Madhab, PolarCircleResolution, Shafaq} from 'adhan';
import {produce} from 'immer';
// eslint-disable-next-line
import ReactNativeBlobUtil from 'react-native-blob-util';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import createVanilla from 'zustand/vanilla';
import {Prayer, PrayersInOrder} from '@/adhan';
import {AdhanEntry, INITIAL_ADHAN_AUDIO_ENTRIES} from '@/assets/adhan_entries';
import {CountryInfo, SearchResult} from '@/utils/geonames';
import {PREFERRED_LOCALE} from '@/utils/locale';

const SETTINGS_STORAGE_KEY = 'SETTINGS_STORAGE';

export const ADHAN_NOTIFICATION_SUFFIX = '_NOTIFY';
export const ADHAN_SOUND_SUFFIX = '_SOUND';

export function getAdhanSettingKey(
  prayer: Prayer,
  k: 'sound' | 'notify',
): keyof SettingsStore {
  if (k === 'notify') {
    return (prayer.toUpperCase() +
      ADHAN_NOTIFICATION_SUFFIX) as keyof SettingsStore;
  } else {
    return (prayer.toUpperCase() + ADHAN_SOUND_SUFFIX) as keyof SettingsStore;
  }
}

type SettingsStore = {
  // other
  SELECTED_LANGUAGE: string;
  APP_INITIAL_CONFIG_DONE: boolean;
  APP_INTRO_DONE: boolean;
  SAVED_ADHAN_AUDIO_ENTRIES: AdhanEntry[];
  SELECTED_ADHAN_ENTRY: AdhanEntry;
  LOCATION_LAT: number | undefined;
  LOCATION_LONG: number | undefined;
  LOCATION_COUNTRY: CountryInfo | undefined;
  LOCATION_CITY: SearchResult | undefined;
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
  MOTN_NOTIFY?: boolean;
  // prayer sound settings
  FAJR_SOUND?: boolean;
  SUNRISE_SOUND?: boolean;
  DHUHR_SOUND?: boolean;
  ASR_SOUND?: boolean;
  SUNSET_SOUND?: boolean;
  MAGHRIB_SOUND?: boolean;
  ISHA_SOUND?: boolean;
  MOTN_SOUND?: boolean;

  // helpers
  saveAdhanEntry: (entry: AdhanEntry) => void;
  deleteAdhanEntry: (entry: AdhanEntry) => void;
  setSetting: <T extends keyof SettingsStore>(
    key: T,
    val: SettingsStore[T],
  ) => void;
  setSettingCurry: <T extends keyof SettingsStore>(
    key: T,
  ) => (val: SettingsStore[T]) => void;
  removeSetting: (key: keyof SettingsStore) => () => void;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
};

const invalidKeys = ['setSetting', 'setSettingCurry', 'removeSetting'];

export const settings = createVanilla<SettingsStore>()(
  persist(
    set => ({
      SELECTED_LANGUAGE: PREFERRED_LOCALE,
      APP_INITIAL_CONFIG_DONE: false,
      APP_INTRO_DONE: false,
      SAVED_ADHAN_AUDIO_ENTRIES: INITIAL_ADHAN_AUDIO_ENTRIES,
      SELECTED_ADHAN_ENTRY: INITIAL_ADHAN_AUDIO_ENTRIES[0],
      LOCATION_LAT: undefined,
      LOCATION_LONG: undefined,
      LOCATION_COUNTRY: undefined,
      LOCATION_CITY: undefined,
      CALCULATION_METHOD_KEY: undefined,
      HIGH_LATITUDE_RULE: undefined,
      ASR_CALCULATION: Madhab.Shafi,
      SHAFAQ: Shafaq.General,
      POLAR_RESOLUTION: PolarCircleResolution.Unresolved,

      // adhan entry helper
      saveAdhanEntry: entry =>
        set(
          produce<SettingsStore>(draft => {
            let fIndex = draft.SAVED_ADHAN_AUDIO_ENTRIES.findIndex(
              e => e.id === entry.id,
            );
            if (fIndex !== -1) {
              draft.SAVED_ADHAN_AUDIO_ENTRIES.splice(fIndex, 1, entry);
            } else {
              draft.SAVED_ADHAN_AUDIO_ENTRIES.push(entry);
            }
          }),
        ),

      deleteAdhanEntry: entry =>
        set(
          produce<SettingsStore>(draft => {
            let fIndex = draft.SAVED_ADHAN_AUDIO_ENTRIES.findIndex(
              e => e.id === entry.id,
            );
            if (fIndex !== -1) {
              draft.SAVED_ADHAN_AUDIO_ENTRIES.splice(fIndex, 1);
              if (typeof entry.filepath === 'string') {
                ReactNativeBlobUtil.fs.unlink(entry.filepath).catch(err => {
                  console.error(err);
                });
              }
            }
            if (
              draft.SELECTED_ADHAN_ENTRY &&
              draft.SELECTED_ADHAN_ENTRY.id === entry.id
            ) {
              draft.SELECTED_ADHAN_ENTRY = draft.SAVED_ADHAN_AUDIO_ENTRIES[0];
            }
          }),
        ),

      // general
      setSetting: <T extends keyof SettingsStore>(
        key: T,
        val: SettingsStore[T],
      ) =>
        set(
          produce<SettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            draft[key] = val;
          }),
        ),
      setSettingCurry:
        <T extends keyof SettingsStore>(key: T) =>
        (val: SettingsStore[T]) =>
          set(
            produce<SettingsStore>(draft => {
              if (invalidKeys.includes(key)) return;
              draft[key] = val;
            }),
          ),
      removeSetting: key => () =>
        set(
          produce<SettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            delete draft[key];
          }),
        ),
      _hasHydrated: false,
      setHasHydrated: state => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      getStorage: () => AsyncStorage,
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
      onRehydrateStorage: () => (state, err) => {
        if (state && !err) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

export function waitTillHydration() {
  if (settings.getState()._hasHydrated) {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    const unsubFinishHydration = settings.persist.onFinishHydration(() => {
      resolve();
      unsubFinishHydration();
    });
  });
}

export const useSettings = create(settings);

export function useSettingsHelper<T extends keyof SettingsStore>(key: T) {
  return useSettings(state => [state[key], state.setSettingCurry(key)]) as [
    SettingsStore[T],
    (val: SettingsStore[T]) => void,
  ];
}

export function hasAtLeastOneNotificationSetting() {
  for (let prayer of PrayersInOrder) {
    if (settings.getState()[getAdhanSettingKey(prayer, 'notify')]) {
      return true;
    }
  }
  return false;
}
