import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { STICKY_NOTE_MIN_HEIGHT, STICKY_NOTE_MIN_WIDTH } from '../../../constants/stickyNote.constants';
import { useStickyNotesStore } from '../../../store/stickyNotesStore';
import { StickyNoteWrapper } from './StickyNoteWrapper';
import { StickyNoteWrapperTrashZone } from './StickyNoteWrapperTrashZone/StickyNoteWrapperTrashZone';

describe('StickyNoteWrapper', () => {
  it('renders the add-note control', () => {
    render(<StickyNoteWrapper />);

    expect(screen.getByRole('button', { name: 'Add Note' })).toBeInTheDocument();
  });

  it('enables the trash-zone styles while a note is dragged over it', () => {
    const { rerender } = render(<StickyNoteWrapperTrashZone />);
    const trashZone = screen.getByLabelText('Trash zone');

    expect(trashZone).toHaveAttribute('data-active', 'false');
    expect(trashZone.className).not.toContain('active');

    rerender(<StickyNoteWrapperTrashZone isActive />);

    expect(trashZone).toHaveAttribute('data-active', 'true');
    expect(trashZone.className).toContain('active');
  });

  it('deletes a note when it is dropped on the trash zone', () => {
    useStickyNotesStore.setState({
      notes: [{
        id: 'note-to-delete',
        color: '#fff59d',
        content: 'Delete me',
        size: { width: 200, height: 160 },
        position: { x: 0, y: 0, z: 1 },
      }],
    });
    render(<StickyNoteWrapper />);

    const note = screen.getByTestId('sticky-note-note-to-delete');
    const trashZone = screen.getByLabelText('Trash zone');
    trashZone.getBoundingClientRect = () => ({
      left: 100,
      right: 300,
      top: 100,
      bottom: 250,
      width: 200,
      height: 150,
      x: 100,
      y: 100,
      toJSON: () => ({}),
    });

    fireEvent.pointerDown(note, {
      button: 0,
      pointerId: 1,
      clientX: 10,
      clientY: 10,
    });
    fireEvent.pointerMove(note, {
      pointerId: 1,
      clientX: 150,
      clientY: 150,
    });
    fireEvent.pointerUp(note, {
      pointerId: 1,
      clientX: 150,
      clientY: 150,
    });

    expect(useStickyNotesStore.getState().notes).toHaveLength(0);
    expect(screen.queryByTestId('sticky-note-note-to-delete')).not.toBeInTheDocument();
  });

  describe('adding a note', () => {
    const startDrawing = () => {
      useStickyNotesStore.setState({ notes: [] });
      render(<StickyNoteWrapper />);

      fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));

      const drawLayer = screen.getByTestId('sticky-note-draw-layer');
      drawLayer.getBoundingClientRect = () => ({
        left: 20,
        right: 820,
        top: 100,
        bottom: 700,
        width: 800,
        height: 600,
        x: 20,
        y: 100,
        toJSON: () => ({}),
      });
      Object.defineProperty(drawLayer, 'clientWidth', { configurable: true, value: 800 });
      Object.defineProperty(drawLayer, 'clientHeight', { configurable: true, value: 600 });

      return drawLayer;
    };

    it('only allows drawing after clicking "Add Note"', () => {
      useStickyNotesStore.setState({ notes: [] });
      render(<StickyNoteWrapper />);

      expect(screen.queryByTestId('sticky-note-draw-layer')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));

      expect(screen.getByTestId('sticky-note-draw-layer')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('creates a note with the drawn position and size, focused and in edit mode', () => {
      const drawLayer = startDrawing();

      fireEvent.pointerDown(drawLayer, { button: 0, pointerId: 1, clientX: 120, clientY: 150 });
      fireEvent.pointerMove(drawLayer, { pointerId: 1, clientX: 420, clientY: 400 });
      fireEvent.pointerUp(drawLayer, { pointerId: 1, clientX: 420, clientY: 400 });

      const notes = useStickyNotesStore.getState().notes;
      expect(notes).toHaveLength(1);
      expect(notes[0].content).toBe('');
      expect(notes[0].position).toEqual({ x: 100, y: 50, z: 1 });
      expect(notes[0].size).toEqual({ width: 300, height: 250 });
      expect(screen.getByRole('textbox')).toHaveFocus();
      expect(screen.getByTestId(`sticky-note-${notes[0].id}`)).toHaveAttribute('aria-pressed', 'true');
      expect(screen.queryByTestId('sticky-note-draw-layer')).not.toBeInTheDocument();
    });

    it('shows a preview of any size while drawing', () => {
      const drawLayer = startDrawing();

      fireEvent.pointerDown(drawLayer, { button: 0, pointerId: 1, clientX: 120, clientY: 150 });
      fireEvent.pointerMove(drawLayer, { pointerId: 1, clientX: 140, clientY: 160 });

      expect(screen.getByTestId('sticky-note-draft')).toHaveStyle({
        left: '100px',
        top: '50px',
        width: '20px',
        height: '10px',
      });
      expect(useStickyNotesStore.getState().notes).toHaveLength(0);
    });

    it('grows a small drawing to the minimum note size', () => {
      const drawLayer = startDrawing();

      fireEvent.pointerDown(drawLayer, { button: 0, pointerId: 1, clientX: 120, clientY: 150 });
      fireEvent.pointerMove(drawLayer, { pointerId: 1, clientX: 140, clientY: 160 });
      fireEvent.pointerUp(drawLayer, { pointerId: 1, clientX: 140, clientY: 160 });

      const [note] = useStickyNotesStore.getState().notes;
      expect(note.position).toEqual({ x: 100, y: 50, z: 1 });
      expect(note.size).toEqual({ width: STICKY_NOTE_MIN_WIDTH, height: STICKY_NOTE_MIN_HEIGHT });
    });

    it('creates a minimum-size note on a plain click', () => {
      const drawLayer = startDrawing();

      fireEvent.pointerDown(drawLayer, { button: 0, pointerId: 1, clientX: 120, clientY: 150 });
      fireEvent.pointerUp(drawLayer, { pointerId: 1, clientX: 120, clientY: 150 });

      const [note] = useStickyNotesStore.getState().notes;
      expect(note.position).toEqual({ x: 100, y: 50, z: 1 });
      expect(note.size).toEqual({ width: STICKY_NOTE_MIN_WIDTH, height: STICKY_NOTE_MIN_HEIGHT });
    });

    it('discards the drawing when the pointer is cancelled', () => {
      const drawLayer = startDrawing();

      fireEvent.pointerDown(drawLayer, { button: 0, pointerId: 1, clientX: 120, clientY: 150 });
      fireEvent.pointerMove(drawLayer, { pointerId: 1, clientX: 420, clientY: 400 });
      fireEvent.pointerCancel(drawLayer, { pointerId: 1 });

      expect(screen.queryByTestId('sticky-note-draft')).not.toBeInTheDocument();
      expect(useStickyNotesStore.getState().notes).toHaveLength(0);
    });

    it('cancels drawing with the Cancel button or Escape', () => {
      startDrawing();

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(screen.queryByTestId('sticky-note-draw-layer')).not.toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(screen.queryByTestId('sticky-note-draw-layer')).not.toBeInTheDocument();
      expect(useStickyNotesStore.getState().notes).toHaveLength(0);
    });
  });

  it('renders multiple notes', () => {
    useStickyNotesStore.setState({
      notes: [
        {
          id: 'note-1',
          color: '#fff59d',
          content: 'Note 1',
          size: { width: 200, height: 160 },
          position: { x: 0, y: 0, z: 1 },
        },
        {
          id: 'note-2',
          color: '#c8e6c9',
          content: 'Note 2',
          size: { width: 220, height: 180 },
          position: { x: 100, y: 100, z: 2 },
        },
      ],
    });
    render(<StickyNoteWrapper />);

    const note1 = screen.getByTestId('sticky-note-note-1');
    const note2 = screen.getByTestId('sticky-note-note-2');

    expect(note1).toBeInTheDocument();
    expect(note2).toBeInTheDocument();
  });
});
