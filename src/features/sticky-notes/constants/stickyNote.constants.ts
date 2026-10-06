export const STICKY_NOTE_MIN_WIDTH = 150;
export const STICKY_NOTE_MIN_HEIGHT = 150;
export const STICKY_NOTE_BASE_COLOR = '#fff59d';

// Pixels the pointer must travel before a press on a note becomes a drag, so clicks
// and double-clicks are not swallowed by tiny accidental movements.
export const STICKY_NOTE_DRAG_THRESHOLD = 4;

export const STICKY_NOTE_COLORS = [
  { name: 'Yellow', value: STICKY_NOTE_BASE_COLOR },
  { name: 'Pink', value: '#f8bbd0' },
  { name: 'Blue', value: '#bbdefb' },
  { name: 'Green', value: '#c8e6c9' },
  { name: 'Purple', value: '#e1bee7' },
] as const;