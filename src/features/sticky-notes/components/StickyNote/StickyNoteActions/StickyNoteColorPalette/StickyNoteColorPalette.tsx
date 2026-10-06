import { STICKY_NOTE_COLORS } from '../../../../constants/stickyNote.constants';
import styles from './StickyNoteColorPalette.module.css';

type Props = {
  onSelect: (color: string) => void;
};

export const StickyNoteColorPalette = ({ onSelect }: Props) => {
  return (
    <div
      role="group"
      aria-label="Choose note color"
      className={styles['color-palette']}
    >
      {STICKY_NOTE_COLORS.map(({ name, value }) => (
        <button
          key={value}
          type="button"
          aria-label={name}
          title={name}
          className={styles['color-swatch']}
          style={{ backgroundColor: value }}
          onClick={() => onSelect(value)}
        />
      ))}
    </div>
  );
};
