import { useRef } from 'react';
import styles from './StickyNoteActions.module.css';

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
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className={styles['sticky-note-actions']}>
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
        title="Move One Step Forward"
        data-tooltip="Move One Step Forward"
        aria-disabled={disabled.moveOneStepForward ?? false}
        onClick={disabled.moveOneStepForward ? undefined : onMoveOneStepForward}
        className={styles['emoji-button']}
      >
        🔽
      </button>
      <button
        title="Move to Back"
        data-tooltip="Move to Back"
        aria-disabled={disabled.moveToBack ?? false}
        onClick={disabled.moveToBack ? undefined : onMoveToBack}
        className={styles['emoji-button']}
      >
        🔼
      </button>
      <button
        title="Move One Step Backward"
        data-tooltip="Move One Step Backward"
        aria-disabled={disabled.moveOneStepBackward ?? false}
        onClick={disabled.moveOneStepBackward ? undefined : onMoveOneStepBackward}
        className={styles['emoji-button']}
      >
        ⏬
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
        onClick={() => colorInputRef.current?.click()}
        className={styles['emoji-button']}
      >
        🎨
      </button>
      <input
        ref={colorInputRef}
        type="color"
        aria-label="Choose note color"
        onChange={(e) => onEditColor(e.target.value)}
        className={styles['color-picker']}
        tabIndex={-1}
      />
      </div>
    </div>
  );
}
