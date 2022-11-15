import { MutableRefObject, useEffect, useRef } from 'react';
import { useKeyboardKey } from '@src/lib/hooks/useKeyboardKey';

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values
declare type Key = 'ArrowUp' | 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'q' | 'e' | ' ' | 'Escape' | 'Enter' | 'Tab';

export const useKeyEvents = () => {
  const useEventRegister = (key: Key, handler: () => void) => {
    const handlerRef: MutableRefObject<(() => void) | undefined> = useRef();
    const { key: translatedKey } = useKeyboardKey(key);

    useEffect(() => {
      handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
      const internalHandler = (e: KeyboardEvent) => {
        if (e.key === translatedKey) {
          if (handlerRef.current) {
            handlerRef.current();
          }
        }
      };
      window.addEventListener('keydown', internalHandler);
      return () => {
        window.removeEventListener('keydown', internalHandler);
      };
    }, [translatedKey]);
  };
  return {
    useEventRegister,
  };
};
