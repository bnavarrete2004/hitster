import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { correctInsertionIndex, isValidInsertion, resolvePlacement, type MockSong } from './timeline.ts';

const song = (id: string, year: number): MockSong => ({ id, title: id, artist: 'Test', releaseYear: year, accent: '#fff' });
const timeline = [song('old', 1965), song('middle', 1986), song('new', 2014)];

describe('timeline placement', () => {
  it('accepts a first card and both outer edges', () => {
    assert.equal(resolvePlacement([], song('first', 2000), 0).correct, true);
    assert.equal(isValidInsertion(timeline, song('earlier', 1950), 0), true);
    assert.equal(isValidInsertion(timeline, song('later', 2020), 3), true);
  });

  it('accepts a chronological insertion between cards', () => {
    const result = resolvePlacement(timeline, song('between', 1977), 1);
    assert.equal(result.correct, true);
    assert.deepEqual(result.timeline.map((card) => card.id), ['old', 'between', 'middle', 'new']);
  });

  it('corrects a wrong insertion to a deterministic chronological position', () => {
    const result = resolvePlacement(timeline, song('between', 1977), 3);
    assert.equal(result.correct, false);
    assert.equal(result.finalIndex, 1);
    assert.deepEqual(result.timeline.map((card) => card.id), ['old', 'between', 'middle', 'new']);
  });

  it('allows any position compatible with equal release years', () => {
    const equal = song('equal', 1986);
    assert.equal(isValidInsertion(timeline, equal, 1), true);
    assert.equal(isValidInsertion(timeline, equal, 2), true);
    assert.equal(correctInsertionIndex(timeline, equal), 1);
  });

  it('rejects invalid positions and a duplicate song', () => {
    assert.equal(isValidInsertion(timeline, song('x', 1977), -1), false);
    assert.equal(isValidInsertion(timeline, song('x', 1977), 1.5), false);
    assert.throws(() => resolvePlacement(timeline, song('x', 1977), 4), RangeError);
    assert.throws(() => resolvePlacement(timeline, song('old', 1965), 0), /already/);
  });
});
