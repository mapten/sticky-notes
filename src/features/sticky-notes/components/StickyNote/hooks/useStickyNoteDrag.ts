import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

type Options = {
  elementRef: RefObject<HTMLElement | null>;
  position: Point;
  size: Size;
  disabled: boolean;
  constrainToParent: boolean;
  onDragStart: () => void;
  onDragEnd: (position: Point) => void;
};

type DragState = {
  active: boolean;
  pointerId: number;
  startX: number;
  startY: number;
  noteStartX: number;
  noteStartY: number;
  x: number;
  y: number;
};

const DRAG_THRESHOLD = 4;

/**
 * A custom hook for managing the drag behavior of a sticky note.
 * It provides the current position of the note, whether it is being dragged,
 * and event handlers for pointer events to manage dragging.
 * 
 * @param options - The options for configuring the drag behavior.
 * @returns An object containing the displayed position, dragging state, and drag event handlers.
 */
export const useStickyNoteDrag = ({
  elementRef,
  position,
  size,
  disabled,
  constrainToParent,
  onDragStart,
  onDragEnd,
}: Options) => {
  const [draggedPosition, setDraggedPosition] = useState<Point | null>(null);
  const dragStateRef = useRef<DragState | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      event.button !== 0
      || disabled
      || (event.target as HTMLElement).closest('button, input, textarea')
    ) {
      return;
    }

    dragStateRef.current = {
      active: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      noteStartX: position.x,
      noteStartY: position.y,
      x: position.x,
      y: position.y,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (dragState?.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - dragState.startX;
    const deltaY = event.clientY - dragState.startY;

    if (!dragState.active) {
      if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) return;

      dragState.active = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      onDragStart();
    }

    const requestedX = dragState.noteStartX + deltaX;
    const requestedY = dragState.noteStartY + deltaY;
    const parent = elementRef.current?.parentElement;
    const nextPosition = constrainToParent && parent
      ? {
          x: Math.min(Math.max(0, requestedX), Math.max(0, parent.clientWidth - size.width)),
          y: Math.min(Math.max(0, requestedY), Math.max(0, parent.clientHeight - size.height)),
        }
      : { x: requestedX, y: requestedY };

    dragState.x = nextPosition.x;
    dragState.y = nextPosition.y;
    setDraggedPosition(nextPosition);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = dragStateRef.current;
    if (dragState?.pointerId !== event.pointerId) return;

    if (dragState.active) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      onDragEnd({ x: dragState.x, y: dragState.y });
    }
    dragStateRef.current = null;
    setDraggedPosition(null);
  };

  const handlePointerCancel = () => {
    dragStateRef.current = null;
    setDraggedPosition(null);
  };

  return {
    displayedPosition: draggedPosition ?? position,
    isDragging: draggedPosition !== null,
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
  };
};
