import {produce} from 'immer';
import {useCallback} from 'react';
import create from 'zustand';
import {persist} from 'zustand/middleware';
import createVanilla from 'zustand/vanilla';
import {zustandStorage} from './mmkv';
import {Prayer} from '@/adhan';

const REMINDER_STORAGE_KEY = 'REMINDER_STORAGE';

export type Reminder = {
  id: string;
  label?: string;
  enabled: boolean;
  prayer: Prayer;
  /** in milliseconds. negative to set before, positive to set after */
  duration: number;
  /** has a value of `-1` or `+1` */
  durationModifier: number;
  /** should reminder play adhan ? */
  playSound?: boolean;
  /** should reminder be set only once? */
  once?: boolean;
};

export type ReminderStore = {
  REMINDERS: Array<Reminder>;

  saveReminder: (reminder: Reminder) => void;
  deleteReminder: (reminder: Pick<Reminder, 'id'>) => void;
  disableReminder: (reminder: Pick<Reminder, 'id'>) => void;
  setSetting: <T extends keyof ReminderStore>(
    key: T,
    val: ReminderStore[T],
  ) => void;
  setSettingCurry: <T extends keyof ReminderStore>(
    key: T,
  ) => (val: ReminderStore[T]) => void;
  removeSetting: (key: keyof ReminderStore) => () => void;
};

const invalidKeys = [
  'setSetting',
  'setSettingCurry',
  'removeSetting',
  'saveReminder',
  'deleteReminder',
  'disableReminder',
];

export const reminderSettings = createVanilla<ReminderStore>()(
  persist(
    set => ({
      REMINDERS: [],
      SHOW_NEXT_PRAYER_TIME: false,

      saveReminder: reminder =>
        set(
          produce<ReminderStore>(draft => {
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
          produce<ReminderStore>(draft => {
            let fIndex = draft.REMINDERS.findIndex(e => e.id === reminder.id);
            if (fIndex !== -1) {
              draft.REMINDERS.splice(fIndex, 1);
            }
          }),
        ),

      disableReminder: reminder =>
        set(
          produce<ReminderStore>(draft => {
            let fIndex = draft.REMINDERS.findIndex(e => e.id === reminder.id);
            if (fIndex !== -1) {
              const [removedReminder] = draft.REMINDERS.splice(fIndex, 1);
              removedReminder.enabled = false;
              draft.REMINDERS.push(removedReminder);
            }
          }),
        ),
      // general
      setSetting: <T extends keyof ReminderStore>(
        key: T,
        val: ReminderStore[T],
      ) =>
        set(
          produce<ReminderStore>(draft => {
            if (invalidKeys.includes(key)) return;
            draft[key] = val;
          }),
        ),
      setSettingCurry:
        <T extends keyof ReminderStore>(key: T) =>
        (val: ReminderStore[T]) =>
          set(
            produce<ReminderStore>(draft => {
              if (invalidKeys.includes(key)) return;
              draft[key] = val;
            }),
          ),
      removeSetting: key => () =>
        set(
          produce<ReminderStore>(draft => {
            if (invalidKeys.includes(key)) return;
            delete draft[key];
          }),
        ),
    }),
    {
      name: REMINDER_STORAGE_KEY,
      getStorage: () => zustandStorage,
      partialize: state =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !invalidKeys.includes(key)),
        ),
      version: 0,
      migrate: (persistedState, version) => {
        /* eslint-disable no-fallthrough */
        // fall through cases is exactly the use case for migration.
        switch (version) {
          case 0:
            // this will be run when storage version is changed to 1
            break;
        }
        /* eslint-enable no-fallthrough */
        return persistedState as ReminderStore;
      },
    },
  ),
);

export const useReminderSettings = create(reminderSettings);

export function useReminderSettingsHelper<T extends keyof ReminderStore>(
  key: T,
) {
  const state = useReminderSettings(s => s[key]);
  const setterCurry = useReminderSettings(s => s.setSettingCurry);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setCallback = useCallback(setterCurry(key), [key]);
  return [state, setCallback] as [
    ReminderStore[T],
    (val: ReminderStore[T]) => void,
  ];
}
