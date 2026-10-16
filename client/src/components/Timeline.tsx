import { useDroppable } from '@dnd-kit/core';
import { LayoutGroup, motion, useReducedMotion } from 'motion/react';
import { SongCard } from './SongCard';
import type { MockSong } from '../game/timeline';

interface TimelineProps {
  cards: MockSong[];
  pendingSong: MockSong | null;
  selectedIndex: number | null;
  canSelect: boolean;
  revealed: boolean;
  onSelect: (index: number) => void;
}

function TimelineSlot({ index, selected, canSelect, onSelect }: {
  index: number;
  selected: boolean;
  canSelect: boolean;
  onSelect: (index: number) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${index}`, disabled: !canSelect });
  return (
    <button
      ref={setNodeRef}
      type="button"
      disabled={!canSelect}
      className={`timeline-slot ${selected || isOver ? 'timeline-slot--active' : ''}`}
      aria-label={`Colocar carta en posición ${index + 1}`}
      aria-pressed={selected}
      onClick={() => onSelect(index)}
    >
      <span className="slot-plus">+</span>
      <span className="slot-label">{index === 0 ? 'ANTES' : 'AQUÍ'}</span>
    </button>
  );
}

export function Timeline({ cards, pendingSong, selectedIndex, canSelect, revealed, onSelect }: TimelineProps) {
  const reducedMotion = useReducedMotion();
  const items = [...cards];
  if (pendingSong && selectedIndex !== null) items.splice(selectedIndex, 0, pendingSong);

  return (
    <div className="timeline-scroll">
      <LayoutGroup>
        <div className="timeline-track">
          <div className="timeline-rule" aria-hidden="true" />
          {canSelect && selectedIndex !== 0 && <TimelineSlot index={0} selected={false} canSelect onSelect={onSelect} />}
          {items.map((card) => {
            const isPending = card.id === pendingSong?.id;
            const slotIndex = cards.findIndex((item) => item.id === card.id) + 1;
            return (
              <div key={card.id} className="timeline-item-wrap">
                <motion.div
                  layout
                  className={`timeline-card ${isPending ? 'timeline-card--pending' : ''}`}
                  transition={{ layout: reducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 290, damping: 28 } }}
                >
                  <SongCard song={card} revealed={!isPending || revealed} compact />
                  <span className="timeline-year-tag">{isPending && !revealed ? '???' : card.releaseYear}</span>
                </motion.div>
                {canSelect && !isPending && selectedIndex !== slotIndex && <TimelineSlot index={slotIndex} selected={false} canSelect onSelect={onSelect} />}
              </div>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
