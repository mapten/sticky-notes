import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';

import { useStickyNotesStore } from '../../store/stickyNotesStore';
import { StickyNote } from './StickyNote';

const note = {
  id: 'note-1',
  color: '#fff59d',
  size: { width: 240, height: 200 },
  content: 'Double-click to edit',
  position: { x: 20, y: 30, z: 1 },
};

describe('StickyNote', () => {
  beforeEach(() => {
    useStickyNotesStore.setState({ notes: [note] });
  });

  it('enters edit mode when its content is double-clicked', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    await user.dblClick(screen.getByText(note.content));

    expect(screen.getByRole('textbox')).toHaveValue(note.content);
    const noteElement = screen.getByTestId(`sticky-note-${note.id}`);
    expect(noteElement).toHaveAttribute(
      'class',
      expect.stringContaining('editing'),
    );

    fireEvent.pointerDown(noteElement, { pointerId: 1, button: 0, clientX: 20, clientY: 30 });
    fireEvent.pointerMove(noteElement, { pointerId: 1, clientX: 120, clientY: 130 });
    fireEvent.pointerUp(noteElement, { pointerId: 1, clientX: 120, clientY: 130 });

    expect(useStickyNotesStore.getState().notes[0].position).toEqual(note.position);
  });

  it('enters edit mode when the Enter key is pressed while focused', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    const noteElement = screen.getByTestId(`sticky-note-${note.id}`);
    await user.click(noteElement);

    await user.keyboard('{Enter}');

    expect(screen.getByRole('textbox')).toHaveValue(note.content);
    expect(noteElement).toHaveAttribute(
      'class',
      expect.stringContaining('editing'),
    );
  });

  it('enters edit mode when the Space key is pressed while focused', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    const noteElement = screen.getByTestId(`sticky-note-${note.id}`);
    await user.click(noteElement);

    await user.keyboard('{Space}');

    expect(screen.getByRole('textbox')).toHaveValue(note.content);
    expect(noteElement).toHaveAttribute(
      'class',
      expect.stringContaining('editing'),
    );
  });

  it('does not enter edit mode when the Enter key is pressed while focused on a child element', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    const noteElement = screen.getByTestId(`sticky-note-${note.id}`);
    await user.click(noteElement);

    const colorButton = screen.getByTitle('Edit Color');
    colorButton.focus();

    await user.keyboard('{Enter}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not enter edit mode when the Space key is pressed while focused on a child element', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    const noteElement = screen.getByTestId(`sticky-note-${note.id}`);
    await user.click(noteElement);

    const colorButton = screen.getByTitle('Edit Color');
    colorButton.focus();

    await user.keyboard('{Space}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('exits edit mode when the Escape key is pressed', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    await user.dblClick(screen.getByText(note.content));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Discard this change');

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(useStickyNotesStore.getState().notes[0].content).toBe(note.content);
  });

  it('exits edit mode when the Save button is clicked', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    await user.dblClick(screen.getByText(note.content));

    expect(screen.getByRole('textbox')).toHaveValue(note.content);

    const saveButton = screen.getByTitle('Save');
    await user.click(saveButton);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('exits edit mode when the Cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    await user.dblClick(screen.getByText(note.content));

    expect(screen.getByRole('textbox')).toHaveValue(note.content);

    const cancelButton = screen.getByTitle('Cancel');
    await user.click(cancelButton);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('exits edit mode when clicking outside the note', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <StickyNote id={note.id} />
        <button>Outside Button</button>
      </div>,
    );

    await user.dblClick(screen.getByText(note.content));

    const textarea = screen.getByRole('textbox');
    await user.clear(textarea);
    await user.type(textarea, 'Saved by clicking outside');

    const outsideButton = screen.getByText('Outside Button');
    await user.click(outsideButton);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    expect(useStickyNotesStore.getState().notes[0].content).toBe('Saved by clicking outside');
  });

  it('exits edit mode when the note loses focus', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <StickyNote id={note.id} />
        <button>Outside Button</button>
      </div>,
    );

    await user.dblClick(screen.getByText(note.content));

    expect(screen.getByRole('textbox')).toHaveValue(note.content);

    const outsideButton = screen.getByText('Outside Button');

    // Simulate losing focus by clicking the outside button
    await user.click(outsideButton);

    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('does not exit edit mode when clicking inside the note', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    await user.dblClick(screen.getByText(note.content));

    expect(screen.getByRole('textbox')).toHaveValue(note.content);

    const noteElement = screen.getByTestId(`sticky-note-${note.id}`);
    await user.click(noteElement);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('does not exit edit mode when clicking on a child element', async () => {
    const user = userEvent.setup();
    render(<StickyNote id={note.id} />);

    await user.dblClick(screen.getByText(note.content));

    expect(screen.getByRole('textbox')).toHaveValue(note.content);

    const colorButton = screen.getByTitle('Edit Color');
    await user.click(colorButton);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
