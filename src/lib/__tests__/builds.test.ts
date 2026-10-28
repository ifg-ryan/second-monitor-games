import { describe, it, expect } from 'vitest';
import { slugify, freeSlug, addLog } from '../builds';

describe('builds', () => {
  it('makes a game id from a title', () => {
    expect(slugify("Hold'em Career Manager")).toBe('hold-em-career-manager');
    expect(slugify('  Café Rush!! 2  ')).toBe('cafe-rush-2');
    expect(slugify('***')).toBe('new-game');
    expect(slugify('x'.repeat(60)).length).toBe(40);
  });
  it('picks a free id', () => {
    expect(freeSlug('fiver', new Set(['hive']))).toBe('fiver');
    expect(freeSlug('fiver', new Set(['fiver', 'fiver-2']))).toBe('fiver-3');
  });
  it('appends to the history and survives a bad log', () => {
    const log = addLog(addLog('not json', 'uploaded'), 'pushed', 'make it faster');
    const list = JSON.parse(log);
    expect(list.map((e: { event: string }) => e.event)).toEqual(['uploaded', 'pushed']);
    expect(list[1].text).toBe('make it faster');
  });
});
