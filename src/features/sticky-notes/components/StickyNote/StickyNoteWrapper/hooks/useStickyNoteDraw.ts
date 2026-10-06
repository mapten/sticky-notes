import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import { fitNoteRect, getDrawnRect, type Rect } from '../utils/getDrawnNoteRect';

type Options = {
  minSize: { width: number; height: number };
  onDraw: (rect: Rect) => void;
};

type DrawState = {
  pointerId: number;
  start: { x: number; y: number };
  rect: Rect;
};

/**
 * A custom hook for drawing a new note by dragging on the board. The handlers must
 * be attached to an element covering the board, so its coordinates match the notes'.
 * The note can be drawn at any size; it is grown to `minSize` when created, so a
 * plain click creates a minimum-size note at that point.
 *
 * @param options - The minimum note size and the callback that receives the final rectangle.
 * @returns The rectangle being drawn (to render a preview) and the pointer handlers.
 */
export const useStickyNoteDraw = ({ minSize, onDraw }: Options) => {
  const [draftRect, setDraftRect] = useState<Rect | null>(null);
  const drawStateRef = useRef<DrawState | null>(null);

  const getPoint = (event: ReactPointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  };

  const getBounds = (element: HTMLElement) => ({
    width: element.clientWidth,
    height: element.clientHeight,
  });

  const reset = () => {
    drawStateRef.current = null;
    setDraftRect(null);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.button !== 0) return;

    const start = getPoint(event);
    const rect = { ...start, width: 0, height: 0 };
    event.currentTarget.setPointerCapture(event.pointerId);
    drawStateRef.current = { pointerId: event.pointerId, start, rect };
    setDraftRect(rect);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const drawState = drawStateRef.current;
    if (drawState?.pointerId !== event.pointerId) return;

    const rect = getDrawnRect(drawState.start, getPoint(event), getBounds(event.currentTarget));
    // Kept in the ref too: pointerup may fire before React re-renders with draftRect
    drawState.rect = rect;
    setDraftRect(rect);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    const drawState = drawStateRef.current;
    if (drawState?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onDraw(fitNoteRect(drawState.rect, minSize, getBounds(event.currentTarget)));
    reset();
  };

  return {
    draftRect,
    drawHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: reset,
    },
  };
};
