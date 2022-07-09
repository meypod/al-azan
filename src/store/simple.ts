import {storage} from './mmkv';

export async function get<T>(key: string): Promise<T | null> {
  const data = JSON.parse(storage.getString(key) || 'null') as T;
  return data;
}

export async function set<T>(
  key: string,
  data: Record<string, T>,
): Promise<void> {
  storage.set(key, JSON.stringify(data || null));
}
