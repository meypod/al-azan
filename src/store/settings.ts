import {produce} from 'immer';
import {ColorMode} from 'native-base';
import {useCallback} from 'react';
import {FileSystem} from 'react-native-file-access';
import {useStore} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {createStore} from 'zustand/vanilla';
import {alarmSettings} from './alarm';
import {zustandStorage} from './mmkv';
import {Prayer} from '@/adhan';
import {
  AdhanEntry,
  adhanEntryTranslations,
  INITIAL_ADHAN_AUDIO_ENTRIES,
} from '@/assets/adhan_entries';
import {ADHAN_NOTIFICATION_ID} from '@/constants/notification';
import type {AudioEntry} from '@/modules/media_player';
import {CountryInfo, SearchResult} from '@/utils/geonames';
import {PREFERRED_LOCALE} from '@/utils/locale';

export const SETTINGS_STORAGE_KEY = 'SETTINGS_STORAGE';

export type SettingsStore = {
  /** an object that keeps track of dismissed alarms timestamp by their notification id */
  DELIVERED_ALARM_TIMESTAMPS: Record<string, number | undefined>;
  // theme
  THEME_COLOR?: ColorMode | 'default';
  // display
  IS_24_HOUR_FORMAT: boolean;
  NUMBERING_SYSTEM: string;
  // other
  SELECTED_LOCALE: string;
  SELECTED_ARABIC_CALENDAR: string;
  SELECTED_SECONDARY_CALENDAR: string;
  APP_INITIAL_CONFIG_DONE: boolean;
  APP_INTRO_DONE: boolean;
  SAVED_ADHAN_AUDIO_ENTRIES: AdhanEntry[];
  SAVED_USER_AUDIO_ENTRIES: AudioEntry[];
  SELECTED_ADHAN_ENTRY: AdhanEntry;
  SELECTED_FAJR_ADHAN_ENTRY: AdhanEntry | undefined;
  LOCATION_COUNTRY: CountryInfo | undefined;
  LOCATION_CITY: SearchResult | undefined;
  LAST_APP_FOCUS_TIMESTAMP?: number;
  HIDDEN_PRAYERS: Array<Prayer>;
  HIDDEN_WIDGET_PRAYERS: Array<Prayer>;
  ADHAN_VOLUME: number;
  // behavior related
  VOLUME_BUTTON_STOPS_ADHAN: boolean;
  // widget
  SHOW_WIDGET: boolean;
  SHOW_WIDGET_COUNTDOWN: boolean;
  ADAPTIVE_WIDGETS: boolean;
  // to detect settings change
  CALC_SETTINGS_HASH: string;
  ALARM_SETTINGS_HASH: string;
  REMINDER_SETTINGS_HASH: string;
  IS_PLAYING_AUDIO: boolean;
  /** permission related */
  DONT_ASK_PERMISSION_NOTIFICATIONS: boolean;
  DONT_ASK_PERMISSION_ALARM: boolean;
  DONT_ASK_PERMISSION_PHONE_STATE: boolean;
  // DEV
  DEV_MODE: boolean;
  // qibla finder related
  QIBLA_FINDER_UNDERSTOOD: boolean;
  QIBLA_FINDER_ORIENTATION_LOCKED: boolean;

  // helper functions
  saveAdhanEntry: (entry: AdhanEntry) => void;
  deleteAdhanEntry: (entry: AdhanEntry) => void;
  saveAudioEntry: (entry: AudioEntry) => void;
  deleteAudioEntry: (entry: AudioEntry) => void;
  saveTimestamp: (alarmId: string, timestamp: number) => void;
  deleteTimestamp: (alarmId: string) => void;
  setSetting: <T extends keyof SettingsStore>(
    key: T,
    val: SettingsStore[T],
  ) => void;
  setSettingCurry: <T extends keyof SettingsStore>(
    key: T,
  ) => (val: SettingsStore[T]) => void;
  removeSetting: (key: keyof SettingsStore) => () => void;
};

const invalidKeys = [
  'setSetting',
  'setSettingCurry',
  'removeSetting',
  'saveAdhanEntry',
  'deleteAdhanEntry',
  'saveTimestamp',
  'deleteTimestamp',
];

export const settings = createStore<SettingsStore>()(
  persist(
    set => ({
      THEME_COLOR: 'default',
      SELECTED_LOCALE: PREFERRED_LOCALE,
      SELECTED_ARABIC_CALENDAR: '',
      SELECTED_SECONDARY_CALENDAR: 'gregory',
      APP_INITIAL_CONFIG_DONE: false,
      APP_INTRO_DONE: false,
      SAVED_ADHAN_AUDIO_ENTRIES: INITIAL_ADHAN_AUDIO_ENTRIES,
      SAVED_USER_AUDIO_ENTRIES: [],
      SELECTED_ADHAN_ENTRY: INITIAL_ADHAN_AUDIO_ENTRIES[0],
      SELECTED_FAJR_ADHAN_ENTRY: undefined,
      LOCATION_COUNTRY: undefined,
      LOCATION_CITY: undefined,
      HIDDEN_PRAYERS: [Prayer.Tahajjud],
      HIDDEN_WIDGET_PRAYERS: [Prayer.Sunset, Prayer.Midnight, Prayer.Tahajjud],
      ADHAN_VOLUME: 70,
      SHOW_WIDGET: false,
      SHOW_WIDGET_COUNTDOWN: false,
      ADAPTIVE_WIDGETS: false,
      IS_24_HOUR_FORMAT: true,
      NUMBERING_SYSTEM: '',
      CALC_SETTINGS_HASH: '',
      ALARM_SETTINGS_HASH: '',
      REMINDER_SETTINGS_HASH: '',
      DELIVERED_ALARM_TIMESTAMPS: {},
      IS_PLAYING_AUDIO: false,
      DONT_ASK_PERMISSION_NOTIFICATIONS: false,
      DONT_ASK_PERMISSION_ALARM: false,
      DONT_ASK_PERMISSION_PHONE_STATE: false,
      DEV_MODE: false,
      QIBLA_FINDER_UNDERSTOOD: false,
      QIBLA_FINDER_ORIENTATION_LOCKED: true,
      VOLUME_BUTTON_STOPS_ADHAN: false,

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
                FileSystem.unlink(entry.filepath).catch(err => {
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

      // user audio entry helper
      saveAudioEntry: entry =>
        set(
          produce<SettingsStore>(draft => {
            let fIndex = draft.SAVED_USER_AUDIO_ENTRIES.findIndex(
              e => e.id === entry.id,
            );
            if (fIndex !== -1) {
              draft.SAVED_USER_AUDIO_ENTRIES.splice(fIndex, 1, entry);
            } else {
              draft.SAVED_USER_AUDIO_ENTRIES.push(entry);
            }
          }),
        ),

      deleteAudioEntry: entry =>
        set(
          produce<SettingsStore>(draft => {
            let fIndex = draft.SAVED_USER_AUDIO_ENTRIES.findIndex(
              e => e.id === entry.id,
            );
            if (fIndex !== -1) {
              draft.SAVED_USER_AUDIO_ENTRIES.splice(fIndex, 1);
              if (typeof entry.filepath === 'string') {
                FileSystem.unlink(entry.filepath).catch(err => {
                  console.error(err);
                });
              }
            }
          }),
        ),

      // for timestamps
      saveTimestamp: (alarmId, timestamp) =>
        set(
          produce<SettingsStore>(draft => {
            draft.DELIVERED_ALARM_TIMESTAMPS[alarmId] = timestamp;
          }),
        ),
      deleteTimestamp: alarmId =>
        set(
          produce<SettingsStore>(draft => {
            delete draft.DELIVERED_ALARM_TIMESTAMPS[alarmId];
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
      storage: createJSONStorage(() => zustandStorage),
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
      version: 8,
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
            (alarmSettings as any).setState({
              REMINDERS: (persistedState as any)['REMINDERS'],
            });
            delete (persistedState as any)['REMINDERS'];
            (persistedState as any)['LAST_WIDGET_UPDATE'] = (
              persistedState as any
            )['LAST_ALARM_DATE_VALUEOF'];
            delete (persistedState as any)['LAST_ALARM_DATE_VALUEOF'];

            // we check before pushing because some users may go back between versions,
            // we don't want to make their settings bigger each time.
            if (
              !(persistedState as SettingsStore).HIDDEN_PRAYERS.includes(
                Prayer.Tahajjud,
              )
            ) {
              (persistedState as SettingsStore).HIDDEN_PRAYERS.push(
                Prayer.Tahajjud,
              );
            }
            if (
              !(persistedState as SettingsStore).HIDDEN_WIDGET_PRAYERS.includes(
                Prayer.Tahajjud,
              )
            ) {
              (persistedState as SettingsStore).HIDDEN_WIDGET_PRAYERS.push(
                Prayer.Tahajjud,
              );
            }
          case 3:
            (persistedState as SettingsStore).DELIVERED_ALARM_TIMESTAMPS = {
              [ADHAN_NOTIFICATION_ID]: (persistedState as any)
                .DISMISSED_ALARM_TIMESTAMP,
            };
            delete (persistedState as any).DISMISSED_ALARM_TIMESTAMP;
            delete (persistedState as any).SCHEDULED_ALARM_TIMESTAMP;
            (persistedState as any).SELECTED_SECONDARY_CALENDAR = 'gregory';
          case 4:
          case 5:
            for (const entry of (persistedState as SettingsStore)
              .SAVED_ADHAN_AUDIO_ENTRIES) {
              if (entry.id in adhanEntryTranslations) {
                entry.label = '';
                entry.internal = true;
              }
            }
          case 6:
            delete (persistedState as any)['LAST_WIDGET_UPDATE'];
          case 7:
            (persistedState as any).QIBLA_FINDER_ORIENTATION_LOCKED = true;
            break;
        }
        /* eslint-enable no-fallthrough */
        return persistedState as SettingsStore;
      },
    },
  ),
);

export function useSettings<T extends keyof SettingsStore>(key: T) {
  const state = useStore(settings, s => s[key], shallow);
  const setterCurry = useStore(settings, s => s.setSettingCurry, shallow);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCallback = useCallback(setterCurry(key), [key]);
  return [state, setCallback] as [
    SettingsStore[T],
    (val: SettingsStore[T]) => void,
  ];
}
