import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Types
import type { StickyNote } from '../models/StickyNote';
import { STICKY_NOTE_BASE_COLOR, STICKY_NOTE_MIN_HEIGHT, STICKY_NOTE_MIN_WIDTH } from '../constants/stickyNote.constants';
import { nanoid } from 'nanoid/non-secure';

type State = {
    notes: StickyNote[];
}

type Actions = {
    addNote: (
        note?: StickyNote,
        initialPosition?: Pick<StickyNote['position'], 'x' | 'y'>,
    ) => string;
    updateColor: (id: string, color: string) => void;
    updateContent: (id: string, content: string) => void;
    updateSize: (id: string, size: { width: number; height: number }) => void;
    /** Moves a note to a new position in cardinal directions x and y */
    moveNoteCardinal: (id: string, x: number, y: number) => void;
    /** Moves a note one step forward in the z-index */
    moveNoteOneStepFront: (id: string) => void;
    /** Moves a note one step backward in the z-index */
    moveNoteOneStepBack: (id: string) => void;
    /** Moves a note to the front (highest z-index) */
    moveNoteToFront: (id: string) => void;
    /** Moves a note to the back (lowest z-index) */
    moveNoteToBack: (id: string) => void;
    deleteNote: (id: string) => void;
    reset: () => void;
}

export type StickyNotesStore = State & Actions;

const createInitialNote = (
    z: number,
    initialPosition: Pick<StickyNote['position'], 'x' | 'y'> = { x: 0, y: 0 },
): StickyNote => ({
    id: nanoid(),
    color: STICKY_NOTE_BASE_COLOR,
    size: { width: STICKY_NOTE_MIN_WIDTH, height: STICKY_NOTE_MIN_HEIGHT },
    content: '',
    position: { ...initialPosition, z },
});

const intialState: State = {
    notes: [],
}

// No-op storage used when localStorage does not exist (e.g. non-browser environments),
// so the persist middleware does not throw.
const unavailableStorage = {
    getItem: () => null,
    setItem: () => undefined,
    removeItem: () => undefined,
};

// Rewrites z-indexes as a contiguous 1..n sequence following array order. Keeping z
// contiguous (no gaps or duplicates) guarantees that a "one step" move always swaps
// with the immediate neighbour, and that z stays bounded however many moves happen.
const normalizeNoteLayers = (notes: StickyNote[]) => (
    notes.map((note, index) => ({
        ...note,
        position: { ...note.position, z: index + 1 },
    }))
);

// Sorts notes by z, moves the target note to the index returned by `getTargetIndex`
// (clamped to the valid range), then renumbers every z. `lastIndex` is the last valid
// insert position once the moved note has been removed from the list.
const reorderNotes = (
    notes: StickyNote[],
    id: string,
    getTargetIndex: (currentIndex: number, lastIndex: number) => number,
) => {
    const orderedNotes = [...notes].sort((a, b) => a.position.z - b.position.z);
    const currentIndex = orderedNotes.findIndex((note) => note.id === id);

    if (currentIndex === -1) return notes;

    const [movedNote] = orderedNotes.splice(currentIndex, 1);
    const targetIndex = Math.min(
        Math.max(0, getTargetIndex(currentIndex, orderedNotes.length)),
        orderedNotes.length,
    );
    orderedNotes.splice(targetIndex, 0, movedNote);

    return normalizeNoteLayers(orderedNotes);
};

export const useStickyNotesStore = create<StickyNotesStore>()(persist((set, get) => ({
    ...intialState,
        addNote: (
            note?: StickyNote,
            initialPosition?: Pick<StickyNote['position'], 'x' | 'y'>,
        ) => {
            const notes = get().notes;
            const newZ = notes.length > 0 ? Math.max(...notes.map((note) => note.position.z)) + 1 : 1;
            const addedNote = note ?? createInitialNote(newZ, initialPosition);

            set((state) => ({ notes: [...state.notes, addedNote] }));
            return addedNote.id;
        },

    updateColor: (id: string, color: string) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, color } : note)
    })),

    updateContent: (id: string, content: string) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, content } : note)
    })),

    updateSize: (id: string, size: { width: number; height: number }) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, size } : note)
    })),

    moveNoteCardinal: (id: string, x: number, y: number) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, position: { ...note.position, x, y } } : note)
    })),

    moveNoteOneStepFront: (id: string) => set((state) => ({
        notes: reorderNotes(state.notes, id, (currentIndex, lastIndex) =>
            Math.min(currentIndex + 1, lastIndex)),
    })),

    moveNoteOneStepBack: (id: string) => set((state) => ({
        notes: reorderNotes(state.notes, id, (currentIndex) => currentIndex - 1),
    })),

    moveNoteToFront: (id: string) => set((state) => ({
        notes: reorderNotes(state.notes, id, (_currentIndex, lastIndex) => lastIndex),
    })),

    moveNoteToBack: (id: string) => set((state) => ({
        notes: reorderNotes(state.notes, id, () => 0),
    })),

    deleteNote: (id: string) => set((state) => ({
        notes: normalizeNoteLayers(
            state.notes
                .filter((note) => note.id !== id)
                .sort((a, b) => a.position.z - b.position.z),
        ),
    })),
    
    reset: () => set(intialState),
}), {
    name: 'sticky-notes-storage',
    storage: createJSONStorage(() => globalThis.localStorage ?? unavailableStorage),
    partialize: (state) => ({ notes: state.notes }),
}));
