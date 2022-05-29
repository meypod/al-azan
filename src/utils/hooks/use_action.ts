import {useCallback, useRef, useState} from 'react';

type GeneralFunction = (...args: any) => any;

type Wrap<T> = {[K in keyof T]-?: [T[K]]};
type Unwrap<T> = {[K in keyof T]: Extract<T[K], [any]>[0]};

type ParametersWithoutAbortSignal<F extends (...args: any) => any> = Wrap<
  Parameters<F>
> extends [...infer InitPs, infer LastP]
  ? LastP extends [AbortSignal]
    ? Unwrap<InitPs>
    : Parameters<F>
  : never;

type Resolve<T> = T extends Promise<infer U> ? U : T;

type useActionOptions = {
  /**
   * Can currrent pending action be cancelled when it's called again ?
   */
  supportsAbort: boolean;
};

/**
 * returns running state and a callback to run your function.
 * won't run the function if it's already running
 */
export function useAction<T extends GeneralFunction>(
  fn: T,
  options?: useActionOptions,
) {
  const {supportsAbort = true} = options || {};
  let immediateIsRunning = useRef(false);
  let [pending, setPending] = useState<boolean>(false);
  let [abortController, setAbortController] = useState<AbortController>(
    new AbortController(),
  );

  let [result, setResult] = useState<Resolve<ReturnType<T>> | undefined>(
    undefined,
  );
  let [error, setError] = useState<unknown>(undefined);

  const runAction = useCallback(
    async (...args: ParametersWithoutAbortSignal<T>) => {
      try {
        let ac = abortController;
        if (immediateIsRunning.current) {
          if (!supportsAbort) {
            return;
          } else {
            ac.abort();
            ac = new AbortController();
            setAbortController(ac);
          }
        }
        immediateIsRunning.current = true;
        setError(undefined);
        setPending(true);
        if (fn.name.includes('fetch')) {
          if (typeof args.at(1) === 'object') {
            args[1].signal = ac.signal;
          } else {
            args[2] = {signal: ac.signal};
          }
        } else {
          args.push(ac.signal);
        }
        const fnResult = await fn(...(args as any[]));
        if (!ac.signal.aborted) {
          setResult(fnResult);
        }
        immediateIsRunning.current = false;
        setPending(false);
        return fnResult;
      } catch (e: any) {
        if (e?.name !== 'AbortError') {
          setError(e);
        }
        immediateIsRunning.current = false;
        setPending(false);
      }
    },
    [abortController, fn, supportsAbort],
  );

  return {
    pending,
    runAction,
    result,
    error,
    abort: abortController.abort,
  };
}
