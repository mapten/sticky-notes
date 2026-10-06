type Point = { x: number; y: number };
type Size = { width: number; height: number };

export type Rect = Point & Size;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Returns the rectangle between the start and current pointer positions of a draw
 * gesture (relative to the board), with the pointer clamped to the board.
 */
export const getDrawnRect = (start: Point, current: Point, bounds: Size): Rect => {
  const endX = clamp(current.x, 0, bounds.width);
  const endY = clamp(current.y, 0, bounds.height);

  return {
    x: Math.min(start.x, endX),
    y: Math.min(start.y, endY),
    width: Math.abs(endX - start.x),
    height: Math.abs(endY - start.y),
  };
};

/**
 * Grows a drawn rectangle to at least `minSize` and shifts it back inside `bounds`
 * if growing pushed it past the board's right or bottom edge.
 */
export const fitNoteRect = (rect: Rect, minSize: Size, bounds: Size): Rect => {
  const width = Math.max(minSize.width, rect.width);
  const height = Math.max(minSize.height, rect.height);

  return {
    x: clamp(rect.x, 0, Math.max(0, bounds.width - width)),
    y: clamp(rect.y, 0, Math.max(0, bounds.height - height)),
    width,
    height,
  };
};
