import { useEffect, useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { DeckCard } from './components/DeckCard';
import { Timeline } from './components/Timeline';
import { mockDeck, resolvePlacement, startingTimeline, type MockSong, type PlacementResult } from './game/timeline';

type Phase = 'ready' | 'staged' | 'revealing' | 'moving' | 'settled' | 'complete';

function App() {
  const [timeline, setTimeline] = useState<MockSong[]>(startingTimeline);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<PlacementResult | null>(null);
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState(0);
  const reducedMotion = useReducedMotion();
  const song = mockDeck[roundIndex];
  const canSelect = phase === 'ready' || phase === 'staged';
  const pendingSong = song && selectedIndex !== null && phase !== 'settled' && phase !== 'complete' ? song : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor),
  );

  useEffect(() => {
    if (!result || phase !== 'revealing') return;
    const timer = window.setTimeout(() => {
      if (result.correct || reducedMotion) {
        setTimeline(result.timeline);
        if (result.correct) setScore((value) => value + 1);
        setSelectedIndex(null);
        setPhase('settled');
      } else {
        setSelectedIndex(result.finalIndex);
        setPhase('moving');
      }
    }, reducedMotion ? 150 : 1150);
    return () => window.clearTimeout(timer);
  }, [phase, reducedMotion, result]);

  useEffect(() => {
    if (!result || phase !== 'moving') return;
    const timer = window.setTimeout(() => {
      setTimeline(result.timeline);
      setSelectedIndex(null);
      setPhase('settled');
    }, 1050);
    return () => window.clearTimeout(timer);
  }, [phase, result]);

  function selectPosition(index: number) {
    if (!canSelect) return;
    setSelectedIndex(index);
    setPhase('staged');
  }

  function handleDragEnd(event: DragEndEvent) {
    if (!canSelect || !event.over) return;
    const match = /^slot-(\d+)$/.exec(String(event.over.id));
    if (match) selectPosition(Number(match[1]));
  }

  function confirmPlacement() {
    if (phase !== 'staged' || selectedIndex === null || !song) return;
    setResult(resolvePlacement(timeline, song, selectedIndex));
    setPhase('revealing');
  }

  function nextRound() {
    if (phase !== 'settled') return;
    setResult(null);
    setSelectedIndex(null);
    if (roundIndex === mockDeck.length - 1) {
      setPhase('complete');
    } else {
      setRoundIndex((index) => index + 1);
      setPhase('ready');
    }
  }

  function restart() {
    setTimeline(startingTimeline);
    setRoundIndex(0);
    setSelectedIndex(null);
    setResult(null);
    setScore(0);
    setPhase('ready');
  }

  const status = phase === 'revealing' || phase === 'moving'
    ? result?.correct ? '¡Acertaste! La carta queda en su sitio.' : 'Casi. La carta busca su lugar correcto.'
    : phase === 'settled'
      ? result?.correct ? '¡Bien colocado! Has ganado un punto.' : 'Esta vez no hay punto, pero la línea de tiempo crece.'
      : phase === 'complete'
        ? 'Has completado el prototipo.'
        : selectedIndex !== null
          ? `Carta preparada en la posición ${selectedIndex + 1}. Confirma para descubrir el año.`
          : 'Arrastra la carta a un hueco o elige uno con el teclado.';

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="app-shell">
        <header className="topbar">
          <div className="brand"><span className="brand-mark">◉</span><span>TIEMPO<span className="brand-dot">.</span></span></div>
          <div className="topbar-right"><span className="prototype-badge">PROTOTIPO · FASE 0</span><span className="topbar-separator" /><span className="score-label">PUNTOS</span><strong className="score-value">{score.toString().padStart(2, '0')}</strong></div>
        </header>

        <main className="main-content">
          <section className="intro">
            <div><div className="eyebrow"><span className="eyebrow-line" /> EL TIEMPO SUENA DIFERENTE</div><h1>Cada canción tiene <em>su momento.</em></h1><p>Coloca la carta oculta donde creas que pertenece. Descubre el año y mira cómo encaja en la historia.</p></div>
            <div className="round-indicator"><span>RONDA</span><strong>{Math.min(roundIndex + 1, mockDeck.length).toString().padStart(2, '0')} <small>/ {mockDeck.length.toString().padStart(2, '0')}</small></strong></div>
          </section>

          <section className="game-board" aria-label="Mesa de juego">
            <div className="board-topline"><span className="board-label">01 / LA CARTA</span><span className="board-label">02 / TU LÍNEA DE TIEMPO</span></div>
            <div className="board-content">
              <aside className="deck-panel">
                <div className="panel-heading"><span className="small-kicker">AHORA SUENA</span><h2>Una canción<br />sin fecha.</h2><p>¿En qué lugar de tu historia la pondrías?</p></div>
                <div className="deck-stage">
                  <div className="deck-shadow-card deck-shadow-card--one" /><div className="deck-shadow-card deck-shadow-card--two" />
                  <AnimatePresence mode="wait">
                    {phase === 'ready' && song ? <motion.div key={song.id} initial={{ opacity: 0, y: 22, rotate: -6 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: reducedMotion ? 0 : 0.35 }}><DeckCard disabled={!canSelect} /></motion.div> :
                      <motion.div key="empty" className="deck-placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><span>↗</span><strong>{phase === 'complete' ? '¡Terminaste!' : 'Carta en la línea'}</strong><small>{phase === 'complete' ? 'Vuelve a jugar' : 'Espera el resultado'}</small></motion.div>}
                  </AnimatePresence>
                </div>
                <span className="deck-footnote">MÚSICA DE PRUEBA · SIN AUDIO EN ESTA FASE</span>
              </aside>

              <div className="timeline-panel">
                <div className="timeline-heading"><div><span className="small-kicker">TU HISTORIA, EN ORDEN</span><h2>Línea de tiempo</h2></div><span className="card-count">{timeline.length} CARTAS</span></div>
                <p className="timeline-instruction">De lo más antiguo a lo más reciente <span aria-hidden="true">→</span></p>
                <Timeline cards={timeline} pendingSong={pendingSong} selectedIndex={selectedIndex} canSelect={canSelect} revealed={phase === 'revealing' || phase === 'moving'} onSelect={selectPosition} />
                <div className="timeline-bottom"><span>1960s</span><div className="timeline-progress"><span /></div><span>HOY</span></div>
              </div>
            </div>
          </section>

          <section className="action-bar" aria-live="polite">
            <div className="status-block"><span className={`status-light ${phase === 'settled' && result?.correct ? 'status-light--good' : ''}`} /><div><span className="status-label">{phase === 'complete' ? 'PARTIDA TERMINADA' : phase === 'settled' ? 'RESULTADO' : canSelect ? 'TU TURNO' : 'DESCUBRIENDO'}</span><p>{status}</p></div></div>
            <div className="action-buttons">
              {phase === 'staged' && <button className="secondary-button" type="button" onClick={() => { setSelectedIndex(null); setPhase('ready'); }}>Cambiar posición</button>}
              {phase === 'staged' && <button className="primary-button" type="button" onClick={confirmPlacement}>Confirmar posición <span aria-hidden="true">→</span></button>}
              {phase === 'settled' && <button className="primary-button" type="button" onClick={nextRound}>{roundIndex === mockDeck.length - 1 ? 'Ver resultado' : 'Siguiente carta'} <span aria-hidden="true">→</span></button>}
              {phase === 'complete' && <button className="primary-button" type="button" onClick={restart}>Jugar de nuevo <span aria-hidden="true">↻</span></button>}
            </div>
          </section>
        </main>
        <footer className="footer"><span>TIEMPO / UN JUEGO DE MEMORIA MUSICAL</span><span>PROTOTIPO DE INTERACCIÓN · DATOS FICTICIOS</span></footer>
      </div>
    </DndContext>
  );
}

export default App;
