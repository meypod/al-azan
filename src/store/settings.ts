import {produce} from 'immer';
import {ColorMode} from 'native-base';
import {useCallback} from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import createVanilla from 'zustand/vanilla';
import {alarmSettings} from './alarm_settings';
import {zustandStorage} from './mmkv';
import {Prayer} from '@/adhan';
import {AdhanEntry, INITIAL_ADHAN_AUDIO_ENTRIES} from '@/assets/adhan_entries';
import {CountryInfo, SearchResult} from '@/utils/geonames';
import {PREFERRED_LOCALE} from '@/utils/locale';

const SETTINGS_STORAGE_KEY = 'SETTINGS_STORAGE';

export type SettingsStore = {
  DISMISSED_ALARM_TIMESTAMP: number;
  // theme
  THEME_COLOR?: ColorMode | 'default';
  // display
  IS_24_HOUR_FORMAT: boolean;
  NUMBERING_SYSTEM: string;
  // other
  SELECTED_LOCALE: string;
  SELECTED_ARABIC_CALENDAR: string;
  APP_INITIAL_CONFIG_DONE: boolean;
  APP_INTRO_DONE: boolean;
  SAVED_ADHAN_AUDIO_ENTRIES: AdhanEntry[];
  SELECTED_ADHAN_ENTRY: AdhanEntry;
  SELECTED_FAJR_ADHAN_ENTRY: AdhanEntry | undefined;
  LOCATION_COUNTRY: CountryInfo | undefined;
  LOCATION_CITY: SearchResult | undefined;
  SCHEDULED_ALARM_TIMESTAMP?: number;
  LAST_APP_FOCUS_TIMESTAMP?: number;
  HIDDEN_PRAYERS: Array<Prayer>;
  HIDDEN_WIDGET_PRAYERS: Array<Prayer>;
  SHOW_WIDGET: boolean;
  ADHAN_VOLUME: number;
  // to detect settings change
  CALC_SETTINGS_HASH: string;
  /** timestamp of when the alarm for updating widget is going to Or was fired */
  LAST_WIDGET_UPDATE: number;

  // helper functions
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
};

const invalidKeys = ['setSetting', 'setSettingCurry', 'removeSetting'];

export const settings = createVanilla<SettingsStore>()(
  persist(
    set => ({
      THEME_COLOR: 'default',
      SELECTED_LOCALE: PREFERRED_LOCALE,
      SELECTED_ARABIC_CALENDAR: '',
      APP_INITIAL_CONFIG_DONE: false,
      APP_INTRO_DONE: false,
      SAVED_ADHAN_AUDIO_ENTRIES: INITIAL_ADHAN_AUDIO_ENTRIES,
      SELECTED_ADHAN_ENTRY: INITIAL_ADHAN_AUDIO_ENTRIES[0],
      SELECTED_FAJR_ADHAN_ENTRY: undefined,
      LOCATION_COUNTRY: undefined,
      LOCATION_CITY: undefined,
      HIDDEN_PRAYERS: [Prayer.Tahajjud],
      HIDDEN_WIDGET_PRAYERS: [Prayer.Sunset, Prayer.Midnight, Prayer.Tahajjud],
      SHOW_WIDGET: false,
      ADHAN_VOLUME: 70,
      IS_24_HOUR_FORMAT: true,
      NUMBERING_SYSTEM: '',
      CALC_SETTINGS_HASH: '',
      DISMISSED_ALARM_TIMESTAMP: 0,
      LAST_WIDGET_UPDATE: 0,

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
            if (
              draft.SELECTED_FAJR_ADHAN_ENTRY &&
              draft.SELECTED_FAJR_ADHAN_ENTRY.id === entry.id
            ) {
              draft.SELECTED_FAJR_ADHAN_ENTRY = undefined;
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
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      getStorage: () => zustandStorage,
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
            // added the IS_24_HOUR_FORMAT field in version 1
            (persistedState as SettingsStore).IS_24_HOUR_FORMAT = true;
          case 1:
            // added NUMBERING_SYSTEM field in v2
            (persistedState as SettingsStore).NUMBERING_SYSTEM = '';
          case 2:
            // moved reminders to alarm settings store
            alarmSettings.setState({
              REMINDERS: (persistedState as any)['REMINDERS'],
            });
            delete (persistedState as any)['REMINDERS'];
            (persistedState as SettingsStore)['LAST_WIDGET_UPDATE'] = (
              persistedState as any
            )['LAST_ALARM_DATE_VALUEOF'];
            delete (persistedState as any)['LAST_ALARM_DATE_VALUEOF'];
            (persistedState as SettingsStore).HIDDEN_PRAYERS.push(
              Prayer.Tahajjud,
            );
            (persistedState as SettingsStore).HIDDEN_WIDGET_PRAYERS.push(
              Prayer.Tahajjud,
            );
            break;
        }
        /* eslint-enable no-fallthrough */
        return persistedState as SettingsStore;
      },
    },
  ),
);

export const useSettings = create(settings);

export function useSettingsHelper<T extends keyof SettingsStore>(key: T) {
  const state = useSettings(s => s[key]);
  const setterCurry = useSettings(s => s.setSettingCurry);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCallback = useCallback(setterCurry(key), [key]);
  return [state, setCallback] as [
    SettingsStore[T],
    (val: SettingsStore[T]) => void,
  ];
}
