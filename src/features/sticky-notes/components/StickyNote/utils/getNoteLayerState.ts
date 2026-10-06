import type { StickyNote } from '../../../models/StickyNote';

export const getNoteLayerState = (notes: StickyNote[], currentZ: number) => {
  if (notes.length === 0) {
    return { isHighest: true, isLowest: true };
  }

  const zIndexes = notes.map((note) => note.position.z);

  return {
    isHighest: currentZ >= Math.max(...zIndexes),
    isLowest: currentZ <= Math.min(...zIndexes),
  };
};
