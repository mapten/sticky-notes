import { create } from 'zustand';

// Types
import type { StickyNote } from '../models/StickyNote';

type State = {
    notes: StickyNote[];
}

type Actions = {
    addNote: (note: StickyNote) => void;
    updateNote: (id: string, updatedFields: Partial<StickyNote>) => void;
    /** Moves a note to a new position in cardinal directions x and y */
    moveNoteCardinal: (id: string, x: number, y: number) => void;
    /** Moves a note one step forward in the z-index */
    moveNoteOneStepFront: (id: string) => void;
    /** Moves a note one step backward in the z-index */
    moveNoteOneStepBack: (id: string) => void;
    /** Moves a note to the front (highest z-index) */
    MoveNoteToFront: (id: string) => void;
    /** Moves a note to the back (lowest z-index) */
    MoveNoteToBack: (id: string) => void;
    deleteNote: (id: string) => void;
    reset: () => void;
}

export type StickyNotesStore = State & Actions;

const intialState: State = {
    notes: [],
}

export const useStickyNotesStore = create<StickyNotesStore>((set) => ({
    ...intialState,
    addNote: (note: StickyNote) => set((state) => ({ notes: [...state.notes, note] })),

    updateNote: (id: string, updatedFields: Partial<StickyNote>) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, ...updatedFields } : note)
    })),

    moveNoteCardinal: (id: string, x: number, y: number) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, position: { ...note.position, x, y } } : note)
    })),

    moveNoteOneStepFront: (id: string) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, position: { ...note.position, z: note.position.z + 1 } } : note)
    })),

    moveNoteOneStepBack: (id: string) => set((state) => ({
        notes: state.notes.map((note) => note.id === id ? { ...note, position: { ...note.position, z: note.position.z - 1 } } : note)
    })),

    MoveNoteToFront: (id: string) => set((state) => {
        const maxZ = Math.max(...state.notes.map((note) => note.position.z));
        return {
            notes: state.notes.map((note) => note.id === id ? { ...note, position: { ...note.position, z: maxZ + 1 } } : note)
        };
    }),

    MoveNoteToBack: (id: string) => set((state) => {
        const minZ = Math.min(...state.notes.map((note) => note.position.z));
        return {
            notes: state.notes.map((note) => note.id === id ? { ...note, position: { ...note.position, z: minZ - 1 } } : note)
        };
    }),

    deleteNote: (id: string) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
    
    reset: () => set(intialState),
}));