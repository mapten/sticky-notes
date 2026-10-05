import { describe, it, expect, beforeEach } from 'vitest';
import { useStickyNotesStore, type StickyNotesStore } from './stickyNotesStore';

const initializeStore = () => {
  useStickyNotesStore.getState().reset();
  return useStickyNotesStore.getState();
};

describe('stickyNotesStore', () => {
  let store: StickyNotesStore;

  beforeEach(() => {
    store = initializeStore();
  });

  it('starts empty', () => {
    const { notes } = useStickyNotesStore.getState();

    expect(notes).toEqual([]);
  });

  it('adds a note', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'First note',
      color: '#fef3c7',
      position: {
        x: 10,
        y: 20,
        z: 0,
      },
    });

    expect(useStickyNotesStore.getState().notes).toHaveLength(1);
    expect(useStickyNotesStore.getState().notes[0]).toMatchObject({
      id: 'n1',
      content: 'First note',
      color: '#fef3c7',
      position: { x: 10, y: 20, z: 0 },
    });
  });

  it('updates an existing note', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'Original',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.updateNote('n1', {
      content: 'Updated',
      position: { x: 25, y: 30, z: 0 },
    });

    expect(useStickyNotesStore.getState().notes[0]).toMatchObject({
      id: 'n1',
      content: 'Updated',
      position: { x: 25, y: 30, z: 0 },
      color: '#fef3c7',
    });
  });

  it('moves a note to a new position', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.moveNoteCardinal('n1', 50, 60);

    expect(useStickyNotesStore.getState().notes[0].position).toEqual({ x: 50, y: 60, z: 0 });
  });

  it('moves a note one step forward in the z-index', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.moveNoteOneStepFront('n1');

    expect(useStickyNotesStore.getState().notes[0].position).toEqual({ x: 0, y: 0, z: 1 });
  });

  it('moves a note one step backward in the z-index', () => {
     store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.moveNoteOneStepBack('n1');

    expect(useStickyNotesStore.getState().notes[0].position).toEqual({ x: 0, y: 0, z: -1 });
  });

  it('moves a note to the front (highest z-index)', () => {

    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.addNote({
      id: 'n2',
      title: 'Note 2',
      content: 'I am on top',
      color: '#fde68a',
      position: { x: 10, y: 10, z: 1 },
    });

    store.MoveNoteToFront('n1');

    expect(useStickyNotesStore.getState().notes.find(note => note.id === 'n1')?.position.z).toBe(2);
  });

  it('moves a note to the back (lowest z-index)', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.addNote({
      id: 'n2',
      title: 'Note 2',
      content: 'I am on top',
      color: '#fde68a',
      position: { x: 10, y: 10, z: 1 },
    });

    store.MoveNoteToBack('n2');

    expect(useStickyNotesStore.getState().notes.find(note => note.id === 'n2')?.position.z).toBe(-1);
  });

  it('removes a note by id', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'One',
      color: '#fef3c7',
      position: { x: 10, y: 20, z: 0 },
    });
    store.addNote({
      id: 'n2',
      title: 'Note 2',
      content: 'Two',
      color: '#fde68a',
      position: { x: 30, y: 40, z: 0 },
    });

    store.deleteNote('n1');

    expect(useStickyNotesStore.getState().notes.map((note) => note.id)).toEqual(['n2']);
  });

  it('resets the store to its initial state', () => {
    store.addNote({
      id: 'n1',
      title: 'Note 1',
      content: 'One',
      color: '#fef3c7',
      position: { x: 10, y: 20, z: 0 },
    });

    store.reset();

    expect(useStickyNotesStore.getState().notes).toEqual([]);
  });
});
