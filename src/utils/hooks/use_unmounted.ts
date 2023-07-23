import {useEffect, useRef} from 'react';

export function useUnmounted(effect: () => void) {
  const callbackRef = useRef(effect);

  useEffect(() => {
    callbackRef.current = effect;
  }, [effect]);

  useEffect(() => {
    return () => {
      callbackRef.current();
    };
  }, []);
}
