import { describe, it, expect, beforeEach, vi } from 'vitest';

/** This is a mock storage for testing purposes, to check that the store persists data correctly */
const storage = vi.hoisted(() => {
  const values = new Map<string, string>();
  const memoryStorage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };

  vi.stubGlobal('localStorage', memoryStorage);
  return memoryStorage;
});

import { useStickyNotesStore, type StickyNotesStore } from './stickyNotesStore';

const initializeStore = () => {
  useStickyNotesStore.getState().reset();
  return useStickyNotesStore.getState();
};

describe('stickyNotesStore', () => {
  let store: StickyNotesStore;

  beforeEach(() => {
    store = initializeStore();
    vi.unstubAllGlobals();
  });

  it('starts empty', () => {
    const { notes } = useStickyNotesStore.getState();

    expect(notes).toEqual([]);
  });

  it('adds a note', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
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

  it('adds a note with default values when no note is provided', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'First note',
      color: '#fef3c7',
      position: {
        x: 10,
        y: 20,
        z: 0,
      },
    });
    store.addNote({
      id: 'n2',
      size: { width: 100, height: 100 },
      content: 'Second note',
      color: '#fef3c7',
      position: {
        x: 10,
        y: 20,
        z: 1,
      },
    });

    store.addNote();

    const addedNote = useStickyNotesStore.getState().notes[2];

    expect(addedNote).toMatchObject({
      size: { width: 200, height: 200 },
      content: '',
      color: '#fff59d',
      position: { x: 0, y: 0, z: 2 },
    });
  });

  it('updates an existing content', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'Original',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.updateContent('n1', 'Updated');

    expect(useStickyNotesStore.getState().notes[0]).toMatchObject({
      id: 'n1',
      content: 'Updated',
      position: { x: 0, y: 0, z: 0 },
      color: '#fef3c7',
    });
  });

  it('updates the color of an existing note', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'Color me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.updateColor('n1', '#fde68a');

    expect(useStickyNotesStore.getState().notes[0]).toMatchObject({
      id: 'n1',
      color: '#fde68a',
    });
  });

  it('updates the size of an existing note', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'Resize me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.updateSize('n1', { width: 150, height: 150 });

    expect(useStickyNotesStore.getState().notes[0]).toMatchObject({
      id: 'n1',
      size: { width: 150, height: 150 },
    });
  });

  it('moves a note to a new position', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
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
      size: { width: 100, height: 100 },
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
      size: { width: 100, height: 100 },
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.moveNoteOneStepBack('n1');

    expect(useStickyNotesStore.getState().notes[0].position).toEqual({ x: 0, y: 0, z: 1 });
  });

  it('moves a note to the front (highest z-index)', () => {

    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.addNote({
      id: 'n2',
      size: { width: 100, height: 100 },
      content: 'I am on top',
      color: '#fde68a',
      position: { x: 10, y: 10, z: 1 },
    });

    store.moveNoteToFront('n1');

    expect(useStickyNotesStore.getState().notes.find(note => note.id === 'n1')?.position.z).toBe(2);
  });

  it('moves a note to the back (lowest z-index)', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'Move me',
      color: '#fef3c7',
      position: { x: 0, y: 0, z: 0 },
    });

    store.addNote({
      id: 'n2',
      size: { width: 100, height: 100 },
      content: 'I am on top',
      color: '#fde68a',
      position: { x: 10, y: 10, z: 1 },
    });

    store.moveNoteToBack('n2');

    expect(useStickyNotesStore.getState().notes.find(note => note.id === 'n2')?.position.z).toBe(1);
  });

  it('reindexes every note without z-index gaps after stacking changes', () => {
    const notes = [
      { id: 'n1', size: { width: 100, height: 100 }, content: '', color: '#fff', position: { x: 0, y: 0, z: 10 } },
      { id: 'n2', size: { width: 100, height: 100 }, content: '', color: '#fff', position: { x: 0, y: 0, z: 30 } },
      { id: 'n3', size: { width: 100, height: 100 }, content: '', color: '#fff', position: { x: 0, y: 0, z: 50 } },
    ];
    const cases = [
      { move: () => useStickyNotesStore.getState().moveNoteOneStepFront('n1'), expectedOrder: ['n2', 'n1', 'n3'] },
      { move: () => useStickyNotesStore.getState().moveNoteOneStepBack('n3'), expectedOrder: ['n1', 'n3', 'n2'] },
      { move: () => useStickyNotesStore.getState().moveNoteToFront('n1'), expectedOrder: ['n2', 'n3', 'n1'] },
      { move: () => useStickyNotesStore.getState().moveNoteToBack('n3'), expectedOrder: ['n3', 'n1', 'n2'] },
    ];

    for (const { move, expectedOrder } of cases) {
      useStickyNotesStore.setState({ notes });
      move();

      const orderedNotes = [...useStickyNotesStore.getState().notes]
        .sort((a, b) => a.position.z - b.position.z);

      expect(orderedNotes.map((note) => note.id)).toEqual(expectedOrder);
      expect(orderedNotes.map((note) => note.position.z)).toEqual([1, 2, 3]);
    }
  });

  it('removes a note by id', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'One',
      color: '#fef3c7',
      position: { x: 10, y: 20, z: 0 },
    });
    store.addNote({
      id: 'n2',
      size: { width: 100, height: 100 },
      content: 'Two',
      color: '#fde68a',
      position: { x: 30, y: 40, z: 0 },
    });

    store.deleteNote('n1');

    expect(useStickyNotesStore.getState().notes.map((note) => note.id)).toEqual(['n2']);
  });

  it('reindexes the remaining layers after deleting a note', () => {
    useStickyNotesStore.setState({
      notes: [
        { id: 'n1', size: { width: 100, height: 100 }, content: '', color: '#fff', position: { x: 0, y: 0, z: 2 } },
        { id: 'n2', size: { width: 100, height: 100 }, content: '', color: '#fff', position: { x: 0, y: 0, z: 7 } },
        { id: 'n3', size: { width: 100, height: 100 }, content: '', color: '#fff', position: { x: 0, y: 0, z: 12 } },
      ],
    });

    useStickyNotesStore.getState().deleteNote('n2');

    const remainingNotes = useStickyNotesStore.getState().notes;
    expect(remainingNotes.map((note) => note.id)).toEqual(['n1', 'n3']);
    expect(remainingNotes.map((note) => note.position.z)).toEqual([1, 2]);
  });

  it('resets the store to its initial state', () => {
    store.addNote({
      id: 'n1',
      size: { width: 100, height: 100 },
      content: 'One',
      color: '#fef3c7',
      position: { x: 10, y: 20, z: 0 },
    });

    store.reset();

    expect(useStickyNotesStore.getState().notes).toEqual([]);
  });

  it('saves notes to localStorage and restores them during hydration', async () => {
    storage.clear();
    const note = {
      id: 'persisted-note',
      size: { width: 180, height: 120 },
      content: 'Remember me',
      color: '#fef3c7',
      position: { x: 20, y: 30, z: 1 },
    };

    store.addNote(note);

    const persistedValue = storage.getItem('sticky-notes-storage');
    expect(JSON.parse(persistedValue!)).toMatchObject({
      state: { notes: [note] },
    });

    useStickyNotesStore.setState({ notes: [] });
    storage.setItem('sticky-notes-storage', persistedValue!);
    await useStickyNotesStore.persist.rehydrate();

    expect(useStickyNotesStore.getState().notes).toEqual([note]);
  });
});
