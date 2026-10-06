import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import type { StickyNote } from '../../../models/StickyNote';
import { useStickyNotesStore } from '../../../store/stickyNotesStore';
import { StickyNoteWrapper } from './StickyNoteWrapper';

const exampleNotes: StickyNote[] = [
  {
    id: 'wrapper-story-note',
    color: '#fff59d',
    size: { width: 240, height: 200 },
    content: 'Drag me over the trash zone',
    position: { x: 96, y: 96, z: 1 },
  },
  {
    id: 'wrapper-story-note-2',
    color: '#c8e6c9',
    size: { width: 220, height: 180 },
    content: 'Another sticky note',
    position: { x: 400, y: 180, z: 2 },
  },
];

const meta = {
  title: 'Templates/StickyNoteWrapper',
  component: StickyNoteWrapper,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      useStickyNotesStore.setState({
        notes: exampleNotes.map((note) => ({
          ...note,
          size: { ...note.size },
          position: { ...note.position },
        })),
      });

      return (
        <div style={{ width: '100%', height: '100dvh', overflow: 'hidden' }}>
          <Story />
        </div>
      );
    },
  ],
} satisfies Meta<typeof StickyNoteWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByLabelText('Trash zone')).toHaveAttribute(
      'data-active',
      'false',
    );
  },
};
