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
  onEditColor: (color: string) => void;
};

export const StickyNoteActions = ({isEditing = false, disabled, onMoveToFront, onMoveOneStepForward, onMoveOneStepBackward, onMoveToBack, onEditNote, onEditColor}: Props) => {
  const colorInputRef = useRef<HTMLInputElement>(null);
  
  return (
    <div className={styles['sticky-note-actions']}>
      <button
        title="Move to Front"
        disabled={disabled.moveToFront}
        onClick={onMoveToFront}
        className={styles['emoji-button']}
      >
        ⏫
      </button>
      <button
        title="Move One Step Forward"
        disabled={disabled.moveOneStepForward}
        onClick={onMoveOneStepForward}
        className={styles['emoji-button']}
      >
        🔽
      </button>
      <button
        title="Move to Back"
        disabled={disabled.moveToBack}
        onClick={ onMoveToBack}
        className={styles['emoji-button']}
      >
        🔼
      </button>
      <button
        title="Move One Step Backward"
        disabled={disabled.moveOneStepBackward}
        onClick={onMoveOneStepBackward}
        className={styles['emoji-button']}
      >
        ⏬
      </button>
      <button
        title={isEditing ? 'Save Note' : 'Edit Note'}
        onClick={onEditNote}
        className={styles['emoji-button']}
      >
        {isEditing ? '💾' : '✏️'}
      </button>
      <div className={styles['color-picker-anchor']}>
        <button
        title="Edit Color"
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
