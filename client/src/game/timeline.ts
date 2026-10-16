export interface MockSong {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  accent: string;
}

export const startingTimeline: MockSong[] = [
  { id: 'anchor-1965', title: 'Primera luz', artist: 'The Satellites', releaseYear: 1965, accent: '#f3a45d' },
  { id: 'anchor-1986', title: 'Noche eléctrica', artist: 'Neon Avenue', releaseYear: 1986, accent: '#c99bf4' },
  { id: 'anchor-2014', title: 'Otra órbita', artist: 'Luna Norte', releaseYear: 2014, accent: '#81c8c0' },
];

export const mockDeck: MockSong[] = [
  { id: 'round-1', title: 'Vuelve a girar', artist: 'Los Cometas', releaseYear: 1977, accent: '#ed8a72' },
  { id: 'round-2', title: 'Días de cristal', artist: 'Aurora Club', releaseYear: 2001, accent: '#8aa9ec' },
  { id: 'round-3', title: 'Mismo verano', artist: 'Solaris', releaseYear: 1986, accent: '#e6c175' },
  { id: 'round-4', title: 'Mapa del cielo', artist: 'Mar Azul', releaseYear: 2020, accent: '#91d4a5' },
];

/** Any insertion that keeps years in non-decreasing order is correct. */
export function isValidInsertion(timeline: readonly MockSong[], song: MockSong, index: number): boolean {
  if (!Number.isInteger(index) || index < 0 || index > timeline.length) return false;
  const previous = timeline[index - 1];
  const next = timeline[index];
  return (!previous || previous.releaseYear <= song.releaseYear)
    && (!next || song.releaseYear <= next.releaseYear);
}

/** Deterministic destination for an incorrect placement: before equal-year songs. */
export function correctInsertionIndex(timeline: readonly MockSong[], song: MockSong): number {
  const index = timeline.findIndex((card) => card.releaseYear >= song.releaseYear);
  return index === -1 ? timeline.length : index;
}

export interface PlacementResult {
  correct: boolean;
  selectedIndex: number;
  finalIndex: number;
  timeline: MockSong[];
}

export function resolvePlacement(timeline: readonly MockSong[], song: MockSong, selectedIndex: number): PlacementResult {
  if (!Number.isInteger(selectedIndex) || selectedIndex < 0 || selectedIndex > timeline.length) {
    throw new RangeError('Invalid insertion index');
  }
  if (timeline.some((card) => card.id === song.id)) {
    throw new Error('Song is already in the timeline');
  }
  const correct = isValidInsertion(timeline, song, selectedIndex);
  const finalIndex = correct ? selectedIndex : correctInsertionIndex(timeline, song);
  const result = [...timeline];
  result.splice(finalIndex, 0, song);
  return { correct, selectedIndex, finalIndex, timeline: result };
}
