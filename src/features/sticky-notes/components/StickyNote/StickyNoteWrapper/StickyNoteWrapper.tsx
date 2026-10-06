import { useRef, useState } from 'react';

import { STICKY_NOTE_MIN_HEIGHT, STICKY_NOTE_MIN_WIDTH } from '../../../constants/stickyNote.constants';
import { useStickyNotesStore } from '../../../store/stickyNotesStore';
import { StickyNote } from '../StickyNote';
import styles from './StickyNoteWrapper.module.css';
import { StickyNoteWrapperTrashZone } from './StickyNoteWrapperTrashZone/StickyNoteWrapperTrashZone';

export const StickyNoteWrapper = () => {

  const [isTrashZoneActive, setIsTrashZoneActive] = useState(false);
  const [noteToEditId, setNoteToEditId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const trashZoneRef = useRef<HTMLDivElement>(null);
  const isTrashZoneActiveRef = useRef(false);
  const notes = useStickyNotesStore((state) => state.notes);
  const addNote = useStickyNotesStore((state) => state.addNote);
  const deleteNote = useStickyNotesStore((state) => state.deleteNote);

  const handleAddNote = () => {
    const content = contentRef.current;
    const initialPosition = content
      ? {
          x: Math.max(0, (content.clientWidth - STICKY_NOTE_MIN_WIDTH) / 2),
          y: Math.max(0, (content.clientHeight - STICKY_NOTE_MIN_HEIGHT) / 2),
        }
      : { x: 0, y: 0 };

    setNoteToEditId(addNote(undefined, initialPosition));
  };

  const handleDragPointerMove = ({ x, y }: { x: number; y: number }) => {
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
  };

  const handleDragFinished = (noteId: string) => {
    if (isTrashZoneActiveRef.current) {
      deleteNote(noteId);
    }

    isTrashZoneActiveRef.current = false;
    setIsTrashZoneActive(false);
  };

  return (
    <div className={styles['sticky-note-wrapper']}>
      <div className={styles['sticky-note-wrapper-header']}>
        <h1 className={styles['sticky-note-wrapper-title']}>Sticky notes</h1>
        <button
          type="button"
          onClick={handleAddNote}
          className={styles['sticky-note-wrapper-header-button']}
        >
          Add Note
        </button>
      </div>
      <div ref={contentRef} className={styles['sticky-note-wrapper-content']}>
        {notes.map((note) => (
          <StickyNote
            key={note.id}
            id={note.id}
            constrainToParent
            initiallyEditing={note.id === noteToEditId}
            onDragPointerMove={handleDragPointerMove}
            onDragFinished={() => handleDragFinished(note.id)}
          />
        ))}
        <StickyNoteWrapperTrashZone ref={trashZoneRef} isActive={isTrashZoneActive} />
      </div>
    </div>
  );
}

