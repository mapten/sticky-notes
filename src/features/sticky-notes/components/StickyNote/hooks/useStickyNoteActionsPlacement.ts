import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

type Options = {
  noteRef: RefObject<HTMLElement | null>;
  actionsRef: RefObject<HTMLElement | null>;
  active: boolean;
  enabled: boolean;
  position: { x: number; y: number };
};

export const useStickyNoteActionsPlacement = ({
  noteRef,
  actionsRef,
  active,
  enabled,
  position,
}: Options) => {
  const [actionsBelowNote, setActionsBelowNote] = useState(false);

  useLayoutEffect(() => {
    if (!active || !enabled) {
      setActionsBelowNote(false);
      return;
    }

    const updateActionsPlacement = () => {
      const noteElement = noteRef.current;
      const actionsElement = actionsRef.current;
      const parentElement = noteElement?.parentElement;
      if (!noteElement || !actionsElement || !parentElement) return;

      const noteBounds = noteElement.getBoundingClientRect();
      const parentBounds = parentElement.getBoundingClientRect();
      const actionsHeight = actionsElement.getBoundingClientRect().height;
      const rootFontSize = Number.parseFloat(
        getComputedStyle(document.documentElement).fontSize,
      ) || 16;
      const actionsGap = rootFontSize * 0.5;

      setActionsBelowNote(
        noteBounds.top - actionsHeight - actionsGap < parentBounds.top,
      );
    };

    updateActionsPlacement();
    window.addEventListener('resize', updateActionsPlacement);
    return () => window.removeEventListener('resize', updateActionsPlacement);
  }, [active, enabled, noteRef, actionsRef, position.x, position.y]);

  return actionsBelowNote;
};