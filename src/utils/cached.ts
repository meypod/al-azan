import {get, set} from '@/store/simple';

type GeneralFunction = (...args: any) => any;

/**
 * Returns a cached version of the function result if exists, runs and caches the function results otherwise.
 */
export async function getCached<T extends GeneralFunction>(
  key: string,
  fn: T,
): Promise<Awaited<ReturnType<T>>> {
  let result = await get<ReturnType<T>>(key);
  if (result) {
    return result;
  }
  const fnResult = await fn();
  await set(key, fnResult);
  return fnResult;
}
