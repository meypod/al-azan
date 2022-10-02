import {produce} from 'immer';
import {ColorMode} from 'native-base';
import {useCallback} from 'react';
import ReactNativeBlobUtil from 'react-native-blob-util';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import createVanilla from 'zustand/vanilla';
import {zustandStorage} from './mmkv';
import {Prayer} from '@/adhan';
import {AdhanEntry, INITIAL_ADHAN_AUDIO_ENTRIES} from '@/assets/adhan_entries';
import {CountryInfo, SearchResult} from '@/utils/geonames';
import {PREFERRED_LOCALE} from '@/utils/locale';

const SETTINGS_STORAGE_KEY = 'SETTINGS_STORAGE';

export type WeekDay = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export type Reminder = {
  id: string;
  label?: string;
  enabled: boolean;
  prayer: Prayer;
  /** in milliseconds. negative to set before, positive to set after */
  duration: number;
  /** has a value of `-1` or `+1` */
  durationModifier: number;
};

export type SettingsStore = {
  // theme
  THEME_COLOR?: ColorMode | 'default';
  // display
  IS_24_HOUR_FORMAT: boolean;
  NUMBERING_SYSTEM: string;
  // other
  SELECTED_LOCALE: string;
  APP_INITIAL_CONFIG_DONE: boolean;
  APP_INTRO_DONE: boolean;
  SAVED_ADHAN_AUDIO_ENTRIES: AdhanEntry[];
  SELECTED_ADHAN_ENTRY: AdhanEntry;
  LOCATION_COUNTRY: CountryInfo | undefined;
  LOCATION_CITY: SearchResult | undefined;
  SCHEDULED_ALARM_TIMESTAMP?: number;
  LAST_APP_FOCUS_TIMESTAMP?: number;
  HIDDEN_PRAYERS: Array<Prayer>;
  HIDDEN_WIDGET_PRAYERS: Array<Prayer>;
  SHOW_WIDGET: boolean;
  DISMISSED_ALARM_TIMESTAMP: number;
  ADHAN_VOLUME: number;
  REMINDERS: Array<Reminder>;
  // widget update
  LAST_ALARM_DATE_VALUEOF: number;

  // helper functions
  saveAdhanEntry: (entry: AdhanEntry) => void;
  deleteAdhanEntry: (entry: AdhanEntry) => void;
  saveReminder: (reminder: Reminder) => void;
  deleteReminder: (reminder: Reminder) => void;
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
      APP_INITIAL_CONFIG_DONE: false,
      APP_INTRO_DONE: false,
      SAVED_ADHAN_AUDIO_ENTRIES: INITIAL_ADHAN_AUDIO_ENTRIES,
      SELECTED_ADHAN_ENTRY: INITIAL_ADHAN_AUDIO_ENTRIES[0],
      LOCATION_COUNTRY: undefined,
      LOCATION_CITY: undefined,
      HIDDEN_PRAYERS: [],
      HIDDEN_WIDGET_PRAYERS: [Prayer.Sunset, Prayer.Midnight],
      SHOW_WIDGET: false,
      ADHAN_VOLUME: 70,
      DISMISSED_ALARM_TIMESTAMP: 0,
      REMINDERS: [],
      LAST_ALARM_DATE_VALUEOF: 0,
      IS_24_HOUR_FORMAT: true,
      NUMBERING_SYSTEM: '',

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

      saveReminder: reminder =>
        set(
          produce<SettingsStore>(draft => {
            let fIndex = draft.REMINDERS.findIndex(e => e.id === reminder.id);
            if (fIndex !== -1) {
              draft.REMINDERS.splice(fIndex, 1, reminder);
            } else {
              draft.REMINDERS.push(reminder);
            }
          }),
        ),

      deleteReminder: reminder =>
        set(
          produce<SettingsStore>(draft => {
            let fIndex = draft.REMINDERS.findIndex(e => e.id === reminder.id);
            if (fIndex !== -1) {
              draft.REMINDERS.splice(fIndex, 1);
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
      version: 2,
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
