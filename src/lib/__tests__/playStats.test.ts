import { describe, it, expect } from 'vitest';
import { summarize, dauSeries, periodRange, atlanticDay, duration, type DayRow, type PlayerDay } from '../playStats';

const rows: DayRow[] = [
  { game: 'fiver', day: '2026-10-27', plays: 4, seconds: 400, quick: 1, done: 3 },
  { game: 'fiver', day: '2026-10-28', plays: 2, seconds: 100, quick: 0, done: 2 },
  { game: 'hive', day: '2026-10-28', plays: 2, seconds: 60, quick: 1, done: 0 },
];
const pd: PlayerDay[] = [
  { game: 'fiver', playerId: 'a', day: '2026-10-27' },
  { game: 'fiver', playerId: 'b', day: '2026-10-27' },
  { game: 'fiver', playerId: 'a', day: '2026-10-28' },
  { game: 'hive', playerId: 'a', day: '2026-10-28' },
  { game: 'hive', playerId: 'c', day: '2026-10-28' },
];

describe('playStats', () => {
  it('summarizes one game over a period', () => {
    const s = summarize(rows, pd, periodRange('7d', '2026-10-28', null), 'fiver');
    expect(s.plays).toBe(6);
    expect(s.seconds).toBe(500);
    expect(s.players).toBe(2);
    expect(s.avgDau).toBeCloseTo(3 / 7);
    expect(s.finished).toBeCloseTo(5 / 6);
    expect(s.quickQuits).toBeCloseTo(1 / 6);
    expect(s.playsPerPlayer).toBe(3);
    expect(s.returning).toBe(0.5); // a came back, b did not
  });

  it('counts a player once a day across the site, and returning uses days before the period', () => {
    const s = summarize(rows, pd, periodRange('today', '2026-10-28', null), null);
    expect(s.plays).toBe(4);
    expect(s.players).toBe(2); // a (two games) and c
    expect(s.avgDau).toBe(2);
    expect(s.returning).toBe(0.5); // a also played yesterday
  });

  it('all time starts at the first day with data; empty periods read as no data', () => {
    expect(periodRange('all', '2026-10-28', '2026-10-27')).toEqual({ from: '2026-10-27', to: '2026-10-28', days: 2 });
    const none = summarize([], [], periodRange('today', '2026-10-28', null), 'fiver');
    expect(none.finished).toBeNull();
    expect(none.avgSeconds).toBe(0);
  });

  it('daily players series and helpers', () => {
    expect(dauSeries(pd, '2026-10-28', 3)).toEqual([
      { day: '2026-10-26', players: 0 },
      { day: '2026-10-27', players: 2 },
      { day: '2026-10-28', players: 2 },
    ]);
    expect(atlanticDay(new Date('2026-10-29T02:00:00Z'))).toBe('2026-10-28');
    expect(duration(3725)).toBe('1h 2m');
    expect(duration(95)).toBe('1m 35s');
  });
});
