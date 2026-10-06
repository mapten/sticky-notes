import { describe, expect, it, vi } from 'vitest';

import { fireEvent, render } from '@testing-library/react';
import type { ComponentProps } from 'react';

import { StickyNoteActions } from './StickyNoteActions';

describe('StickyNoteActions', () => {
  const renderUI = (props: Partial<ComponentProps<typeof StickyNoteActions>> = {}) => {
    return render(
      <StickyNoteActions
        disabled={{}}
        onMoveToFront={() => {}}
        onMoveOneStepForward={() => {}}
        onMoveOneStepBackward={() => {}}
        onMoveToBack={() => {}}
        onEditNote={() => {}}
        onEditColor={() => {}}
        {...props}
      />
    );
  };

  it('disables buttons correctly', () => {
    const { getByTitle } = renderUI({
      disabled: {
        moveToFront: true,
        moveOneStepForward: true,
        moveOneStepBackward: true,
        moveToBack: false,
      },
    });

    expect(getByTitle('Move to Front')).toHaveAttribute('aria-disabled', 'true');
    expect(getByTitle('Move One Step Forward')).toHaveAttribute('aria-disabled', 'true');
    expect(getByTitle('Move One Step Backward')).toHaveAttribute('aria-disabled', 'true');
    expect(getByTitle('Move to Back')).toHaveAttribute('aria-disabled', 'false');
  });

  it('calls the correct callbacks when buttons are clicked', () => {
    const onMoveToFront = vi.fn();
    const onMoveOneStepForward = vi.fn();
    const onMoveOneStepBackward = vi.fn();
    const onMoveToBack = vi.fn();
    const onEditNote = vi.fn();
    const onEditColor = vi.fn();

    const { getByLabelText, getByTitle } = renderUI({
      onMoveToFront,
      onMoveOneStepForward,
      onMoveOneStepBackward,
      onMoveToBack,
      onEditNote,
      onEditColor,
    });
    const colorInput = getByLabelText('Choose note color');
    const colorInputClick = vi.spyOn(colorInput, 'click');

    getByTitle('Move to Front').click();
    getByTitle('Move One Step Forward').click();
    getByTitle('Move One Step Backward').click();
    getByTitle('Move to Back').click();
    getByTitle('Edit Note').click();
    getByTitle('Edit Color').click();
    fireEvent.change(colorInput, { target: { value: '#ff0000' } });

    expect(onMoveToFront).toHaveBeenCalled();
    expect(onMoveOneStepForward).toHaveBeenCalled();
    expect(onMoveOneStepBackward).toHaveBeenCalled();
    expect(onMoveToBack).toHaveBeenCalled();
    expect(onEditNote).toHaveBeenCalled();
    expect(colorInputClick).toHaveBeenCalledOnce();
    expect(onEditColor).toHaveBeenCalledWith('#ff0000');
  });
});
  
