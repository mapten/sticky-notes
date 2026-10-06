import { useEffect } from 'react';
import type { RefObject } from 'react';

type Options = {
  elementRef: RefObject<HTMLElement | null>;
  active: boolean;
  onDismiss: () => void;
};

/**
 * A custom hook for managing dismissible focus behavior.
 */
export const useDismissibleFocus = ({ elementRef, active, onDismiss }: Options) => {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!elementRef.current?.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
        elementRef.current?.blur();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, elementRef, onDismiss]);
};
