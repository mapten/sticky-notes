import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

type Options = {
  noteRef: RefObject<HTMLElement | null>;
  actionsRef: RefObject<HTMLElement | null>;
  active: boolean;
  enabled: boolean;
  position: { x: number; y: number };
};

/**
 * Decides whether the actions toolbar should flip below the note because there is
 * not enough room above it inside the parent (the toolbar would otherwise be clipped
 * by the parent's `overflow: hidden`).
 *
 * Uses useLayoutEffect so the measurement and flip happen before paint, avoiding a
 * one-frame flicker of the toolbar in the wrong place.
 */
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
      // Must match the `0.5rem` gap used by `.sticky-note-actions-container` in StickyNote.module.css
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