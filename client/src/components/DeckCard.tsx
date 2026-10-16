import { useDraggable } from '@dnd-kit/core';
import { motion, useReducedMotion } from 'motion/react';
import { SongCard } from './SongCard';

export function DeckCard({ disabled }: { disabled: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'hidden-card', disabled });
  const reducedMotion = useReducedMotion();
  return (
    <div ref={setNodeRef} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, zIndex: isDragging ? 20 : 1 }}>
      <motion.button
        type="button"
        className="deck-draggable"
        aria-label="Arrastrar canción oculta a la línea de tiempo"
        disabled={disabled}
        animate={{ scale: isDragging && !reducedMotion ? 1.05 : 1, rotate: isDragging && !reducedMotion ? -3 : 0, y: isDragging && !reducedMotion ? -10 : 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 24 }}
        {...listeners}
        {...attributes}
      >
        <SongCard revealed={false} active />
      </motion.button>
    </div>
  );
}
