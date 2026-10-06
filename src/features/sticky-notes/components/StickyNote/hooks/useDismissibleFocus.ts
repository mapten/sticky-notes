import { useEffect } from 'react';
import type { RefObject } from 'react';

type Options = {
  elementRef: RefObject<HTMLElement | null>;
  active: boolean;
  onDismiss: () => void;
  onEscape?: () => void;
};

/**
 * A custom hook for managing dismissible focus behavior.
 *
 * Listens at the document level (only while `active`) because the element can be
 * "focused" in React state without holding DOM focus — e.g. after a resize, whose
 * pointerdown calls preventDefault — so a blur event alone is not enough to detect
 * clicks outside.
 */
export const useDismissibleFocus = ({ elementRef, active, onDismiss, onEscape }: Options) => {
  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!elementRef.current?.contains(event.target as Node)) {
        onDismiss();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        (onEscape ?? onDismiss)();
        elementRef.current?.blur();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active, elementRef, onDismiss, onEscape]);
};
