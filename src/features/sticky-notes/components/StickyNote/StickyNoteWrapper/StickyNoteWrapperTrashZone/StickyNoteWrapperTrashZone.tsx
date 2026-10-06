import { forwardRef } from 'react';

import styles from './StickyNoteWrapperTrashZone.module.css';

type StickyNoteWrapperTrashZoneProps = {
  isActive?: boolean;
};

export const StickyNoteWrapperTrashZone = forwardRef<
  HTMLDivElement,
  StickyNoteWrapperTrashZoneProps
>(({ isActive = false }, ref) => {
  return (
    <div
      ref={ref}
      aria-label="Trash zone"
      data-active={isActive}
      className={`${styles['sticky-note-wrapper-trash-zone']} ${
        isActive ? styles.active : ''
      }`}
    >
      <span
        aria-hidden="true"
        className={styles['sticky-note-wrapper-trash-zone-icon']}
      >
        &#x1F5D1;&#xFE0F;
      </span>
      <span className={styles['sticky-note-wrapper-trash-zone-label']}>
        Drag a note here to delete it
      </span>
    </div>
  );
});

StickyNoteWrapperTrashZone.displayName = 'StickyNoteWrapperTrashZone';
