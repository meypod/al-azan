import {storage} from './mmkv';

export function getItem<T>(key: string): T | null {
  const data = JSON.parse(storage.getString(key) || 'null') as T;
  return data;
}

export function setItem<T>(key: string, data: Record<string, T>) {
  storage.set(key, JSON.stringify(data || null));
}

export function deleteItem(key: string) {
  storage.delete(key);
}

export function deleteItemStartingWith(key: string) {
  for (const k of storage.getAllKeys()) {
    if (k.startsWith(key)) {
      storage.delete(k);
    }
  }
}
