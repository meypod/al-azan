import {produce} from 'immer';
import {createJSONStorage, persist} from 'zustand/middleware';
import {createStore} from 'zustand/vanilla';
import {zustandStorage} from './mmkv';
import {Prayer} from '@/adhan';

export const COUNTER_STORAGE_KEY = 'COUNTER_STORAGE';

export type Counter = {
  id: string;
  label?: string;
  count: number;
  lastModified?: number;
  lastCount?: number;
};

export type CounterStore = {
  counters: Array<Counter>;

  updateCounter: (id: string, value: Counter) => void;
  removeCounter: (id: string) => void;
  increaseCounter: (id: string) => void;
  decreaseCounter: (id: string) => void;
  setCounters: (counters: Array<Counter>) => void;
};

const invalidKeys = [
  'updateCounter',
  'removeCounter',
  'increaseCounter',
  'decreaseCounter',
  'setCounters',
];

export const counterStore = createStore<CounterStore>()(
  persist(
    set => ({
      counters: [
        {id: Prayer.Fajr, count: 0},
        {id: Prayer.Dhuhr, count: 0},
        {id: Prayer.Asr, count: 0},
        {id: Prayer.Maghrib, count: 0},
        {id: Prayer.Isha, count: 0},
        {id: 'fast', count: 0},
      ],

      // general
      updateCounter: (id: string, val: Counter) =>
        set(
          produce<CounterStore>(draft => {
            let fIndex = draft.counters.findIndex(e => e.id === id);
            if (fIndex !== -1) {
              draft.counters[fIndex] = val;
            } else {
              draft.counters.push(val);
            }
          }),
        ),
      removeCounter: (id: string) =>
        set(
          produce<CounterStore>(draft => {
            let fIndex = draft.counters.findIndex(e => e.id === id);
            if (fIndex !== -1) {
              draft.counters.splice(fIndex, 1);
            }
          }),
        ),
      increaseCounter: (id: string) =>
        set(
          produce<CounterStore>(draft => {
            let fIndex = draft.counters.findIndex(e => e.id === id);
            if (fIndex !== -1) {
              draft.counters[fIndex].lastCount = draft.counters[fIndex].count;
              draft.counters[fIndex].lastModified = Date.now();
              draft.counters[fIndex].count++;
            }
          }),
        ),
      decreaseCounter: (id: string) =>
        set(
          produce<CounterStore>(draft => {
            let fIndex = draft.counters.findIndex(e => e.id === id);
            if (fIndex !== -1) {
              draft.counters[fIndex].lastCount = draft.counters[fIndex].count;
              draft.counters[fIndex].lastModified = Date.now();
              draft.counters[fIndex].count--;
            }
          }),
        ),
      setCounters: (counters: Array<Counter>) =>
        set(
          produce<CounterStore>(draft => {
            draft.counters = counters;
          }),
        ),
    }),
    {
      name: COUNTER_STORAGE_KEY,
      storage: createJSONStorage(() => zustandStorage),
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
        return persistedState as CounterStore;
      },
    },
  ),
);
