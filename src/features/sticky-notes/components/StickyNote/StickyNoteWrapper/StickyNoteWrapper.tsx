import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { STICKY_NOTE_MIN_HEIGHT, STICKY_NOTE_MIN_WIDTH } from '../../../constants/stickyNote.constants';
import { useStickyNotesStore } from '../../../store/stickyNotesStore';
import { StickyNote } from '../StickyNote';
import styles from './StickyNoteWrapper.module.css';
import { StickyNoteWrapperTrashZone } from './StickyNoteWrapperTrashZone/StickyNoteWrapperTrashZone';
import { useStickyNoteDraw } from './hooks/useStickyNoteDraw';
import type { Rect } from './utils/getDrawnNoteRect';

const MIN_NOTE_SIZE = {
  width: STICKY_NOTE_MIN_WIDTH,
  height: STICKY_NOTE_MIN_HEIGHT,
};

export const StickyNoteWrapper = () => {

  const [isTrashZoneActive, setIsTrashZoneActive] = useState(false);
  // While true, an overlay covers the board and the next drag on it draws a new note.
  const [isDrawing, setIsDrawing] = useState(false);
  // The most recently added note, which mounts directly in edit mode.
  const [noteToEditId, setNoteToEditId] = useState<string | null>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  // Mirrors isTrashZoneActive: the drop handler runs right after the last pointer move,
  // before React re-renders, so it must read the latest value from a ref.
  const isTrashZoneActiveRef = useRef(false);
  const notes = useStickyNotesStore((state) => state.notes);
  const addNote = useStickyNotesStore((state) => state.addNote);
  const deleteNote = useStickyNotesStore((state) => state.deleteNote);

  const { draftRect, drawHandlers } = useStickyNoteDraw({
    minSize: MIN_NOTE_SIZE,
    onDraw: ({ x, y, width, height }: Rect) => {
      setNoteToEditId(addNote(undefined, { x, y }, { width, height }));
      setIsDrawing(false);
    },
  });

  useEffect(() => {
    if (!isDrawing) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDrawing(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDrawing]);

  // Hit-tests the pointer (viewport coordinates), not the note's bounds, so a note
  // is deleted only when the cursor itself is dropped on the trash zone.
  const handleDragPointerMove = useCallback(({ x, y }: { x: number; y: number }) => {
    const bounds = trashZoneRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const isPointerOverTrashZone = (
      x >= bounds.left
      && x <= bounds.right
      && y >= bounds.top
      && y <= bounds.bottom
    );

    isTrashZoneActiveRef.current = isPointerOverTrashZone;
    setIsTrashZoneActive(isPointerOverTrashZone);
  }, []);

  const handleDragFinished = useCallback((noteId: string) => {
    if (isTrashZoneActiveRef.current) {
      deleteNote(noteId);
    }

    isTrashZoneActiveRef.current = false;
    setIsTrashZoneActive(false);
  }, [deleteNote]);

  // Memoized so the wrapper's frequent re-renders (draw preview, trash-zone hover)
  // reuse the same elements and React skips re-rendering every note.
  const noteElements = useMemo(() => notes.map((note) => (
    <StickyNote
      key={note.id}
      id={note.id}
      constrainToParent
      initiallyEditing={note.id === noteToEditId}
      onDragPointerMove={handleDragPointerMove}
      onDragFinished={() => handleDragFinished(note.id)}
    />
  )), [notes, noteToEditId, handleDragPointerMove, handleDragFinished]);

  return (
    <div className={styles['sticky-note-wrapper']}>
      <div className={styles['sticky-note-wrapper-header']}>
        <h1 className={styles['sticky-note-wrapper-title']}>Sticky notes</h1>
        <div className={styles['sticky-note-wrapper-header-actions']}>
          {isDrawing && (
            <span className={styles['sticky-note-wrapper-hint']}>
              Drag on the board to draw the note, or press Esc to cancel
            </span>
          )}
          <button
            type="button"
            aria-pressed={isDrawing}
            onClick={() => setIsDrawing((drawing) => !drawing)}
            className={styles['sticky-note-wrapper-header-button']}
          >
            {isDrawing ? 'Cancel' : 'Add Note'}
          </button>
        </div>
      </div>
      <div className={styles['sticky-note-wrapper-content']}>
        {noteElements}
        <StickyNoteWrapperTrashZone ref={trashZoneRef} isActive={isTrashZoneActive} />
        {isDrawing && (
          <div
            data-testid="sticky-note-draw-layer"
            className={styles['sticky-note-wrapper-draw-layer']}
            {...drawHandlers}
          >
            {draftRect && (
              <div
                aria-hidden="true"
                data-testid="sticky-note-draft"
                className={styles['sticky-note-wrapper-draft']}
                style={{
                  left: `${draftRect.x}px`,
                  top: `${draftRect.y}px`,
                  width: `${draftRect.width}px`,
                  height: `${draftRect.height}px`,
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
