import { describe, expect, it } from 'vitest';
import { safeNext } from '../safeNext';

describe('safeNext', () => {
  it('keeps paths on this site', () => {
    expect(safeNext('/play/fiver')).toBe('/play/fiver');
    expect(safeNext('/leaderboard?x=1#fiver')).toBe('/leaderboard?x=1#fiver');
  });
  it.each(['//evil.com', '/\\evil.com', '/\\\\evil.com', '/\t/evil.com', 'https://evil.com', 'evil.com', '', null, undefined])('rejects %s', (raw) => {
    expect(safeNext(raw as string)).toBe('/');
  });
});
