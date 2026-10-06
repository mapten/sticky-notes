import { describe, expect, it } from 'vitest';

import { fitNoteRect, getDrawnRect } from './getDrawnNoteRect';

const bounds = { width: 800, height: 600 };
const minSize = { width: 150, height: 150 };

describe('getDrawnRect', () => {
  it('returns the rectangle between the start and current points', () => {
    expect(getDrawnRect({ x: 100, y: 50 }, { x: 400, y: 300 }, bounds)).toEqual({
      x: 100,
      y: 50,
      width: 300,
      height: 250,
    });
  });

  it('supports drawing up and to the left of the start point', () => {
    expect(getDrawnRect({ x: 400, y: 300 }, { x: 100, y: 50 }, bounds)).toEqual({
      x: 100,
      y: 50,
      width: 300,
      height: 250,
    });
  });

  it('allows rectangles smaller than the minimum note size', () => {
    expect(getDrawnRect({ x: 100, y: 100 }, { x: 120, y: 110 }, bounds)).toEqual({
      x: 100,
      y: 100,
      width: 20,
      height: 10,
    });
  });

  it('clamps the pointer to the board bounds', () => {
    expect(getDrawnRect({ x: 600, y: 400 }, { x: 1200, y: -50 }, bounds)).toEqual({
      x: 600,
      y: 0,
      width: 200,
      height: 400,
    });
  });
});

describe('fitNoteRect', () => {
  it('keeps rectangles that are already big enough', () => {
    const rect = { x: 100, y: 50, width: 300, height: 250 };

    expect(fitNoteRect(rect, minSize, bounds)).toEqual(rect);
  });

  it('grows small rectangles to the minimum size', () => {
    expect(fitNoteRect({ x: 100, y: 100, width: 20, height: 0 }, minSize, bounds)).toEqual({
      x: 100,
      y: 100,
      width: 150,
      height: 150,
    });
  });

  it('shifts a grown rectangle back inside the board near an edge', () => {
    expect(fitNoteRect({ x: 750, y: 580, width: 10, height: 10 }, minSize, bounds)).toEqual({
      x: 650,
      y: 450,
      width: 150,
      height: 150,
    });
  });
});
