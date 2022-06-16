import AsyncStorage from '@react-native-async-storage/async-storage';
import {produce} from 'immer';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import {PrayersInOrder} from '@/adhan';
import {INITIAL_ADHAN_AUDIO_ENTRIES} from '@/assets/adhan_entries';
import {
  APP_INITIAL_CONFIG_DONE,
  APP_INTRO_DONE,
  getAdhanSettingKey,
  SAVED_ADHAN_AUDIO_ENTRIES,
  SELECTED_ADHAN_ENTRY,
  SELECTED_LANGUAGE,
} from '@/constants/settings';
import {PREFERRED_LOCALE} from '@/utils/locale';

const SETTINGS_STORAGE_KEY = 'SETTINGS_STORAGE';

type SettingsStore = Record<string, unknown> & {
  setSetting: (key: string) => (val: unknown) => void;
  removeSetting: (key: string) => () => void;
};

const invalidKeys = ['setSetting', 'removeSetting'];

export const useStore = create<SettingsStore>()(
  persist(
    set => ({
      setSetting: (key: string) => (val: unknown) =>
        set(
          produce<SettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            draft[key] = val;
          }),
        ),
      removeSetting: (key: string) => () =>
        set(
          produce<SettingsStore>(draft => {
            if (invalidKeys.includes(key)) return;
            delete draft[key];
          }),
        ),
    }),
    {
      name: SETTINGS_STORAGE_KEY,
      getStorage: () => AsyncStorage,
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
    },
  ),
);

export function useStoreHelper<T>(key: string) {
  return useStore(state => [state[key], state.setSetting(key)]) as [
    T | undefined,
    (val: T) => void,
  ];
}

type StoredSettings = {
  state: Record<string, unknown>;
  version: number;
};

export type Settings = {
  raw: StoredSettings;
  get<T>(key: string): T;
  set<T>(key: string, val: T): void;
};

const EMPTY_STORE = '{"state":{},"version":0}';

export async function getSettings(): Promise<Settings> {
  const settings = JSON.parse(
    (await AsyncStorage.getItem(SETTINGS_STORAGE_KEY)) || EMPTY_STORE,
  ) as StoredSettings;
  return {
    raw: settings,
    get<T>(key: string) {
      return settings.state[key] as any as T;
    },
    set<T>(key: string, val: T) {
      settings.state[key] = val;
    },
  };
}

export async function setSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(
    SETTINGS_STORAGE_KEY,
    JSON.stringify(settings.raw || {}),
  );
}

export async function hasAtLeastOneNotificationSetting(settings: Settings) {
  for (let prayer of PrayersInOrder) {
    if (settings.get<boolean>(getAdhanSettingKey(prayer, 'notify'))) {
      return true;
    }
  }
  return false;
}

export async function setupDefaultSettings() {
  const settings = await getSettings();

  if (!settings.get<boolean>(APP_INITIAL_CONFIG_DONE)) {
    // prevent doing setup again
    settings.set(APP_INITIAL_CONFIG_DONE, true);

    // setup app intro
    settings.set(APP_INTRO_DONE, false);

    // setup adhan entries
    settings.set(SAVED_ADHAN_AUDIO_ENTRIES, INITIAL_ADHAN_AUDIO_ENTRIES);
    settings.set(SELECTED_ADHAN_ENTRY, INITIAL_ADHAN_AUDIO_ENTRIES[0]);

    // setup language
    settings.set(SELECTED_LANGUAGE, PREFERRED_LOCALE);

    await setSettings(settings);
  }

  return settings;
}
