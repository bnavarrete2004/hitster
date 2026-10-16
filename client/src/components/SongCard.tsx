import { motion, useReducedMotion } from 'motion/react';
import type { CSSProperties } from 'react';
import type { MockSong } from '../game/timeline';

interface SongCardProps {
  song?: MockSong;
  revealed: boolean;
  active?: boolean;
  compact?: boolean;
}

export function SongCard({ song, revealed, active = false, compact = false }: SongCardProps) {
  const reducedMotion = useReducedMotion();
  return (
    <div className={`card-scene ${compact ? 'card-scene--compact' : ''}`}>
      <motion.div
        className="card-inner"
        initial={false}
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={`card-face card-back ${active ? 'card-back--active' : ''}`}>
          <span className="card-corner">T / M</span>
          <span className="record-art" aria-hidden="true"><span /></span>
          <span className="card-back-caption">ESCUCHA · DESCUBRE · ORDENA</span>
        </div>
        <div className="card-face card-front" style={{ '--card-accent': song?.accent ?? '#e9ad7f' } as CSSProperties}>
          <span className="card-corner">T / M</span>
          <span className="card-year">{song?.releaseYear ?? '—'}</span>
          <div className="card-song-details">
            <span className="card-label">CANCIÓN REVELADA</span>
            <strong>{song?.title ?? 'Canción'}</strong>
            <span>{song?.artist ?? 'Artista'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
