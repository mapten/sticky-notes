import { useState } from 'react';
import styles from './StickyNoteActions.module.css';
import { StickyNoteColorPalette } from './StickyNoteColorPalette/StickyNoteColorPalette';

type Props = {
  isEditing?: boolean;
  disabled: Partial<{
    moveToFront: boolean;
    moveOneStepForward: boolean;
    moveOneStepBackward: boolean;
    moveToBack: boolean;
  }>;
  onMoveToFront: () => void;
  onMoveOneStepForward: () => void;
  onMoveOneStepBackward: () => void;
  onMoveToBack: () => void;
  onEditNote: () => void;
  onCancelEdit?: () => void;
  onEditColor: (color: string) => void;
};

export const StickyNoteActions = ({isEditing = false, disabled, onMoveToFront, onMoveOneStepForward, onMoveOneStepBackward, onMoveToBack, onEditNote, onCancelEdit, onEditColor}: Props) => {
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  
  return (
    <div className={styles['sticky-note-actions']}>

      <button
        title="Move to Back"
        data-tooltip="Move to Back"
        aria-disabled={disabled.moveToBack ?? false}
        onClick={disabled.moveToBack ? undefined : onMoveToBack}
        className={styles['emoji-button']}
      >
        ⏬
      </button>
      <button
        title="Move One Step Backward"
        data-tooltip="Move One Step Backward"
        aria-disabled={disabled.moveOneStepBackward ?? false}
        onClick={disabled.moveOneStepBackward ? undefined : onMoveOneStepBackward}
        className={styles['emoji-button']}
      >
        🔽
      </button>
      <button
        title="Move One Step Forward"
        data-tooltip="Move One Step Forward"
        aria-disabled={disabled.moveOneStepForward ?? false}
        onClick={disabled.moveOneStepForward ? undefined : onMoveOneStepForward}
        className={styles['emoji-button']}
      >
        🔼
      </button>
      <button
        title="Move to Front"
        data-tooltip="Move to Front"
        aria-disabled={disabled.moveToFront ?? false}
        onClick={disabled.moveToFront ? undefined : onMoveToFront}
        className={styles['emoji-button']}
      >
        ⏫
      </button>
      <button
        title={isEditing ? 'Save' : 'Edit Note'}
        data-tooltip={isEditing ? 'Save' : 'Edit Note'}
        onClick={onEditNote}
        className={styles['emoji-button']}
      >
        {isEditing ? '💾' : '✏️'}
      </button>
      {isEditing && onCancelEdit && (
        <button
          title="Cancel"
          data-tooltip="Cancel"
          onClick={onCancelEdit}
          className={styles['emoji-button']}
        >
          ✖️
        </button>
      )}
      <div className={styles['color-picker-anchor']}>
        <button
        title="Edit Color"
        data-tooltip="Edit Color"
        aria-expanded={isColorPaletteOpen}
        aria-haspopup="true"
        onClick={() => setIsColorPaletteOpen((isOpen) => !isOpen)}
        className={styles['emoji-button']}
      >
        🎨
      </button>
      {isColorPaletteOpen && (
        <StickyNoteColorPalette
          onSelect={(color) => {
            onEditColor(color);
            setIsColorPaletteOpen(false);
          }}
        />
      )}
      </div>
    </div>
  );
}
