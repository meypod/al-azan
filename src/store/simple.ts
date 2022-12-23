import { storage } from './mmkv';

export async function getItem<T>(key: string): Promise<T | null> {
  const data = JSON.parse(storage.getString(key) || 'null') as T;
  return data;
}

export async function setItem<T>(
  key: string,
  data: Record<string, T>,
): Promise<void> {
  storage.set(key, JSON.stringify(data || null));
}

export async function deleteItem(
  key: string
): Promise<void> {
  storage.delete(key);
}
