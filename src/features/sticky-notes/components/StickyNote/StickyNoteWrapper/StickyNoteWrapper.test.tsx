import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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

  it('adds a new note when the add-note control is clicked', () => {
    useStickyNotesStore.setState({ notes: [] });
    render(<StickyNoteWrapper />);

    const addNoteButton = screen.getByRole('button', { name: 'Add Note' });
    fireEvent.click(addNoteButton);

    const notes = useStickyNotesStore.getState().notes;
    expect(notes).toHaveLength(1);
    expect(notes[0].content).toBe('');
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
