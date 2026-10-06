import { useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, RefObject } from 'react';

type Point = { x: number; y: number };
type Size = { width: number; height: number };

type Options = {
  elementRef: RefObject<HTMLElement | null>;
  position: Point;
  size: Size;
  minSize: Size;
  constrainToParent: boolean;
  onResizeStart: () => void;
  onResizeEnd: (size: Size) => void;
};

type ResizeState = {
  pointerId: number;
  startX: number;
  startY: number;
  startWidth: number;
  startHeight: number;
  width: number;
  height: number;
};

/**
 * A custom hook for managing the resize behavior of a sticky note.
 * It provides the current size of the note, and event handlers for pointer events to manage resizing.
 * 
 * @param options - The options for configuring the resize behavior.
 * @returns An object containing the displayed size and resize event handlers.
 */
export const useStickyNoteResize = ({
  elementRef,
  position,
  size,
  minSize,
  constrainToParent,
  onResizeStart,
  onResizeEnd,
}: Options) => {
  const [resizedSize, setResizedSize] = useState<Size | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    // preventDefault avoids text selection / focus moving to the handle;
    // stopPropagation prevents the note's own drag handler from starting a drag.
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    onResizeStart();
    resizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: size.width,
      startHeight: size.height,
      width: size.width,
      height: size.height,
    };
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = resizeStateRef.current;
    if (resizeState?.pointerId !== event.pointerId) return;

    // Resizing grows from the bottom-right corner, so the max size is the space
    // between the note's top-left position and the parent's edges.
    const parent = elementRef.current?.parentElement;
    const maxWidth = constrainToParent && parent
      ? Math.max(0, parent.clientWidth - position.x)
      : Number.POSITIVE_INFINITY;
    const maxHeight = constrainToParent && parent
      ? Math.max(0, parent.clientHeight - position.y)
      : Number.POSITIVE_INFINITY;
    const nextSize = {
      width: Math.min(
        maxWidth,
        Math.max(minSize.width, resizeState.startWidth + event.clientX - resizeState.startX),
      ),
      height: Math.min(
        maxHeight,
        Math.max(minSize.height, resizeState.startHeight + event.clientY - resizeState.startY),
      ),
    };

    resizeState.width = nextSize.width;
    resizeState.height = nextSize.height;
    setResizedSize(nextSize);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const resizeState = resizeStateRef.current;
    if (resizeState?.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    onResizeEnd({ width: resizeState.width, height: resizeState.height });
    resizeStateRef.current = null;
    setResizedSize(null);
  };

  const handlePointerCancel = () => {
    resizeStateRef.current = null;
    setResizedSize(null);
  };

  return {
    displayedSize: resizedSize ?? size,
    resizeHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
    },
  };
};
