import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import type { StickyNote as StickyNoteModel } from '../../models/StickyNote';
import { useStickyNotesStore } from '../../store/stickyNotesStore';
import { StickyNote } from './StickyNote';

const exampleNote: StickyNoteModel = {
  id: 'storybook-note',
  color: '#fff59d',
  size: {
    width: 240,
    height: 200,
  },
  content: 'Click me to show the note actions. Drag the bottom-right handle to resize me.',
  position: {
    x: 80,
    y: 90,
    z: 1,
  },
};

const meta = {
  title: 'Organisms/StickyNote',
  component: StickyNote,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    id: exampleNote.id,
    constrainToParent: true,
  },
  decorators: [
    (Story) => {
      useStickyNotesStore.setState({ notes: [{ ...exampleNote }] });

      return (
        <div
          style={{
            position: 'relative',
            width: 480,
            height: 360,
            border: '1px dashed #bdbdbd',
            borderRadius: 8,
          }}
        >
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof StickyNote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Focused: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const note = canvas.getByTestId(`sticky-note-${exampleNote.id}`);

    await userEvent.click(note);

    await expect(note).toHaveAttribute('aria-pressed', 'true');
    await expect(canvas.getByTitle('Edit Color')).toBeVisible();
  },
};
