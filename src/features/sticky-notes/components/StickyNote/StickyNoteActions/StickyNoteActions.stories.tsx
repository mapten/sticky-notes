import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';

import { StickyNoteActions } from './StickyNoteActions';

const meta = {
  title: 'Molecules/StickyNoteActions',
  component: StickyNoteActions,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    disabled: {},
    onMoveToFront: fn(),
    onMoveOneStepForward: fn(),
    onMoveOneStepBackward: fn(),
    onMoveToBack: fn(),
    onEditNote: fn(),
    onEditColor: fn(),
  },
} satisfies Meta<typeof StickyNoteActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MovementDisabled: Story = {
  args: {
    disabled: {
      moveToFront: true,
      moveOneStepForward: true,
      moveOneStepBackward: true,
      moveToBack: true,
    },
  },
};

export const AtFront: Story = {
  args: {
    disabled: {
      moveToFront: true,
      moveOneStepForward: true,
    },
  },
};

export const AtBack: Story = {
  args: {
    disabled: {
      moveOneStepBackward: true,
      moveToBack: true,
    },
  },
};
