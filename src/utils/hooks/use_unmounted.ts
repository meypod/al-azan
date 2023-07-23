import {useEffect, useRef, EffectCallback, DependencyList} from 'react';

export function useUnmounted(
  effect: EffectCallback,
  dependencies: DependencyList = [],
) {
  const callbackRef = useRef(effect);

  useEffect(() => {
    callbackRef.current = effect;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}
