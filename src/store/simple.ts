import AsyncStorage from '@react-native-async-storage/async-storage';

export async function get<T>(key: string): Promise<T | null> {
  const data = JSON.parse((await AsyncStorage.getItem(key)) || 'null') as T;
  return data;
}

export async function set<T>(
  key: string,
  data: Record<string, T>,
): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(data || null));
}
