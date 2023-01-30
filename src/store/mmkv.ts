import {MMKV} from 'react-native-mmkv';
import {StateStorage} from 'zustand/middleware';

export const storage = new MMKV();

export const zustandStorage: StateStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};
