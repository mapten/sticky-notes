import { useCallback, useRef, useState } from 'react';

import { STICKY_NOTE_MIN_HEIGHT, STICKY_NOTE_MIN_WIDTH } from '../../constants/stickyNote.constants';
import type { StickyNote as StickyNoteModel } from '../../models/StickyNote';
import { useStickyNotesStore } from '../../store/stickyNotesStore';
import styles from './StickyNote.module.css';
import { StickyNoteActions } from './StickyNoteActions/StickyNoteActions';
import { useDismissibleFocus } from './hooks/useDismissibleFocus';
import { useStickyNoteDrag } from './hooks/useStickyNoteDrag';
import { useStickyNoteResize } from './hooks/useStickyNoteResize';
import { getNoteLayerState } from './utils/getNoteLayerState';

type Props = {
  id: StickyNoteModel['id'];
  constrainToParent?: boolean;
  onDragPointerMove?: (pointer: { x: number; y: number }) => void;
  onDragFinished?: () => void;
};

const FALLBACK_POSITION = { x: 0, y: 0, z: 0 };
const FALLBACK_SIZE = {
  width: STICKY_NOTE_MIN_WIDTH,
  height: STICKY_NOTE_MIN_HEIGHT,
};

export const StickyNote = ({ id, constrainToParent = false, onDragPointerMove, onDragFinished }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const stickyNoteRef = useRef<HTMLDivElement>(null);

  const {
    notes,
    updateContent,
    updateColor,
    updateSize,
    moveNoteOneStepFront,
    moveNoteOneStepBack,
    moveNoteToFront,
    moveNoteToBack,
    moveNoteCardinal,
  } = useStickyNotesStore();
  const currentNote = notes.find((note) => note.id === id);
  const position = currentNote?.position ?? FALLBACK_POSITION;
  const size = currentNote?.size ?? FALLBACK_SIZE;

  const handleLostFocus = useCallback(() => {
    if (isEditing) {
      updateContent(id, draftContent);
    }

    setIsFocused(false);
    setIsEditing(false);
    setDraftContent('');
  }, [draftContent, id, isEditing, updateContent]);

  const handleEscape = useCallback(() => {
    setIsFocused(false);
    setIsEditing(false);
    setDraftContent('');
  }, []);

  useDismissibleFocus({
    elementRef: stickyNoteRef,
    active: isFocused,
    onDismiss: handleLostFocus,
    onEscape: handleEscape,
  });

  const { displayedPosition, isDragging, dragHandlers } = useStickyNoteDrag({
    elementRef: stickyNoteRef,
    position,
    size,
    disabled: isEditing,
    constrainToParent,
    onDragStart: () => setIsFocused(true),
    onDragMove: onDragPointerMove,
    onDragEnd: ({ x, y }) => moveNoteCardinal(id, x, y),
    onDragFinish: onDragFinished,
  });

  const { displayedSize, resizeHandlers } = useStickyNoteResize({
    elementRef: stickyNoteRef,
    position,
    size,
    minSize: {
      width: STICKY_NOTE_MIN_WIDTH,
      height: STICKY_NOTE_MIN_HEIGHT,
    },
    constrainToParent,
    onResizeStart: () => setIsFocused(true),
    onResizeEnd: (nextSize) => updateSize(id, nextSize),
  });

  if (!currentNote) {
    console.warn(`StickyNote with id "${id}" not found.`);
    return null;
  }

  const { color, content } = currentNote;
  const { isHighest, isLowest } = getNoteLayerState(notes, position.z);

  const handleStartEditing = () => {
    setDraftContent(content);
    setIsEditing(true);
  };

  const handleSave = () => {
    updateContent(id, draftContent);
    setIsEditing(false);
    setDraftContent('');
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setDraftContent('');
  };

  return (
    <div
      ref={stickyNoteRef}
      role="button"
      {...dragHandlers}
      onFocus={() => setIsFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          handleLostFocus();
        }
      }}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget
          && (event.key === 'Enter' || event.key === ' ' || event.key === 'Space')
        ) {
          event.preventDefault();
          setIsFocused(true);
          handleStartEditing();
        }
      }}
      tabIndex={0}
      aria-pressed={isFocused}
      data-testid={`sticky-note-${id}`}
      className={`${styles['sticky-note']} ${isDragging ? styles['dragging'] : ''} ${isEditing ? styles['editing'] : ''}`}
      style={{
        backgroundColor: color,
        width: `${displayedSize.width}px`,
        height: `${displayedSize.height}px`,
        left: `${displayedPosition.x}px`,
        top: `${displayedPosition.y}px`,
        zIndex: position.z,
      }}
    >
      {isFocused && (
        <div
          className={styles['sticky-note-actions-container']}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <StickyNoteActions
            isEditing={isEditing}
            disabled={{
              moveToFront: isHighest,
              moveOneStepForward: isHighest,
              moveOneStepBackward: isLowest,
              moveToBack: isLowest,
            }}
            onMoveToFront={() => moveNoteToFront(id)}
            onMoveOneStepForward={() => moveNoteOneStepFront(id)}
            onMoveOneStepBackward={() => moveNoteOneStepBack(id)}
            onMoveToBack={() => moveNoteToBack(id)}
            onEditNote={isEditing ? handleSave : handleStartEditing}
            onCancelEdit={handleCancelEditing}
            onEditColor={(newColor) => updateColor(id, newColor)}
          />
        </div>
      )}

      {isEditing ? (
        <textarea
          className={`${styles['sticky-note-content']} ${styles['sticky-note-textarea']}`}
          value={draftContent}
          onChange={(event) => setDraftContent(event.target.value)}
          autoFocus
        />
      ) : (
        <p
          className={styles['sticky-note-content']}
          onDoubleClick={handleStartEditing}
        >
          {content}
        </p>
      )}

      <button
        type="button"
        className={styles['resize-handle']}
        aria-label="Resize note"
        title="Resize note"
        {...resizeHandlers}
      />
    </div>
  );
};
