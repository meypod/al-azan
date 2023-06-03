import {produce} from 'immer';
import {ColorMode} from 'native-base';
import {useCallback} from 'react';
import {FileSystem} from 'react-native-file-access';
import {useStore} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {shallow} from 'zustand/shallow';
import {createStore} from 'zustand/vanilla';
import {clearCache} from './adhan_calc_cache';
import {alarmSettings} from './alarm';
import {zustandStorage} from './mmkv';
import {Prayer, PrayersInOrder} from '@/adhan';
import {
  AdhanEntry,
  adhanEntryTranslations,
  INITIAL_ADHAN_AUDIO_ENTRIES,
} from '@/assets/adhan_entries';
import {ADHAN_NOTIFICATION_ID} from '@/constants/notification';
import type {AudioEntry} from '@/modules/media_player';
import {CountryInfo, CityInfo} from '@/utils/geonames';
import {PREFERRED_LOCALE} from '@/utils/locale';

export const SETTINGS_STORAGE_KEY = 'SETTINGS_STORAGE';

type SelectedAdhanEntries = {[key in Prayer]?: AdhanEntry | undefined} & {
  default: AdhanEntry;
};

export type SettingsStore = {
  /** an object that keeps track of dismissed alarms timestamp by their notification id */
  DELIVERED_ALARM_TIMESTAMPS: Record<string, number | undefined>;
  // theme
  THEME_COLOR?: ColorMode | 'default';
  // display
  IS_24_HOUR_FORMAT: boolean;
  NUMBERING_SYSTEM: string;
  HIGHLIGHT_CURRENT_PRAYER: boolean;
  // other
  SELECTED_LOCALE: string;
  SELECTED_ARABIC_CALENDAR: string;
  SELECTED_SECONDARY_CALENDAR: string;
  APP_INITIAL_CONFIG_DONE: boolean;
  APP_INTRO_DONE: boolean;
  SAVED_ADHAN_AUDIO_ENTRIES: AdhanEntry[];
  SAVED_USER_AUDIO_ENTRIES: AudioEntry[];
  SELECTED_ADHAN_ENTRIES: SelectedAdhanEntries;
  LOCATION_COUNTRY: CountryInfo | undefined;
  LOCATION_CITY: CityInfo | undefined;
  LAST_APP_FOCUS_TIMESTAMP?: number;
  HIDDEN_PRAYERS: Array<Prayer>;
  HIDDEN_WIDGET_PRAYERS: Array<Prayer>;
  ADHAN_VOLUME: number;
  // behavior related
  VOLUME_BUTTON_STOPS_ADHAN: boolean;
  PREFER_EXTERNAL_AUDIO_DEVICE: boolean;
  BYPASS_DND: boolean;
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
  // qada counter
  COUNTER_HISTORY_VISIBLE: boolean;
  // custom adhan screen
  ADVANCED_CUSTOM_ADHAN: boolean;

  // Ramadan related, HIJRI YEAR
  RAMADAN_REMINDED_YEAR: string;
  RAMADAN_REMINDER_DONT_SHOW: boolean;

  // alarm type for adaptive charging compatiblity
  USE_DIFFERENT_ALARM_TYPE: boolean;

  // helper functions
  saveAdhanEntry: (entry: AdhanEntry) => void;
  deleteAdhanEntry: (entry: AdhanEntry) => void;
  setSelectedAdhan: (
    prayer: keyof SelectedAdhanEntries,
    entry: AdhanEntry | undefined,
  ) => void;
  resetPrayerAdhans: (entry: AdhanEntry | undefined) => void;
  saveAudioEntry: (entry: AudioEntry) => void;
  deleteAudioEntry: (entry: AudioEntry) => void;
  saveTimestamp: (alarmId: string, timestamp: number) => void;
  deleteTimestamp: (alarmId: string) => void;
  deleteTimestamps: (alarmId: string[]) => void;
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
      SELECTED_ADHAN_ENTRIES: {default: INITIAL_ADHAN_AUDIO_ENTRIES[0]},
      LOCATION_COUNTRY: undefined,
      LOCATION_CITY: undefined,
      HIDDEN_PRAYERS: [Prayer.Tahajjud],
      HIDDEN_WIDGET_PRAYERS: [Prayer.Sunset, Prayer.Midnight, Prayer.Tahajjud],
      ADHAN_VOLUME: 70,
      SHOW_WIDGET: false,
      SHOW_WIDGET_COUNTDOWN: false,
      ADAPTIVE_WIDGETS: false,
      // DISPLAY
      IS_24_HOUR_FORMAT: true,
      NUMBERING_SYSTEM: '',
      HIGHLIGHT_CURRENT_PRAYER: false,

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
      // behavior
      VOLUME_BUTTON_STOPS_ADHAN: false,
      PREFER_EXTERNAL_AUDIO_DEVICE: false,
      BYPASS_DND: false,
      //
      COUNTER_HISTORY_VISIBLE: false,
      RAMADAN_REMINDED_YEAR: '',
      RAMADAN_REMINDER_DONT_SHOW: false,
      ADVANCED_CUSTOM_ADHAN: false,
      USE_DIFFERENT_ALARM_TYPE: false,

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
            if (draft.SELECTED_ADHAN_ENTRIES['default'].id === entry.id) {
              draft.SELECTED_ADHAN_ENTRIES['default'] =
                draft.SAVED_ADHAN_AUDIO_ENTRIES[0];
            }

            for (const prayer of PrayersInOrder) {
              if (draft.SELECTED_ADHAN_ENTRIES[prayer]?.id === entry.id) {
                draft.SELECTED_ADHAN_ENTRIES[prayer] =
                  draft.SELECTED_ADHAN_ENTRIES['default'];
              }
            }
          }),
        ),

      setSelectedAdhan: (prayer, entry) =>
        set(
          produce<SettingsStore>(draft => {
            if (prayer !== 'default') {
              draft.SELECTED_ADHAN_ENTRIES[prayer] = entry;
            } else {
              draft.SELECTED_ADHAN_ENTRIES[prayer] =
                entry || draft.SAVED_ADHAN_AUDIO_ENTRIES[0];
            }
          }),
        ),

      resetPrayerAdhans: entry =>
        set(
          produce<SettingsStore>(draft => {
            draft.SELECTED_ADHAN_ENTRIES = {
              default: entry || draft.SAVED_ADHAN_AUDIO_ENTRIES[0],
              [Prayer.Fajr]: draft.SELECTED_ADHAN_ENTRIES[Prayer.Fajr],
            };
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
      deleteTimestamps: alarmIds =>
        set(
          produce<SettingsStore>(draft => {
            alarmIds.forEach(id => delete draft.DELIVERED_ALARM_TIMESTAMPS[id]);
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
      version: 10,
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
          case 8:
            // a cache reset force for the incorrect times fix
            clearCache();
          case 9:
            (persistedState as SettingsStore).SELECTED_ADHAN_ENTRIES = {
              default:
                (persistedState as any).SELECTED_ADHAN_ENTRY ||
                (persistedState as SettingsStore).SAVED_ADHAN_AUDIO_ENTRIES[0],
              [Prayer.Fajr]: (persistedState as any).SELECTED_FAJR_ADHAN_ENTRY,
            };
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
