export type StickyNote = {
  id: string;
  color: string;
  size: {
    width: number;
    height: number;
  };
  content: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}
