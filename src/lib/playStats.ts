// Play stats for the lab's Games page, from the Play table (see prisma/schema.prisma).
// The page loads per-day totals and player-days with a few groupBy queries; everything here is
// plain math on those rows, so it is unit tested without a database.

/** Site games outside the kit that send plays (public/smg-play.js), with their names. */
export const SITE_GAMES: Record<string, string> = {
  cryptogram: 'Cryptogram',
  'block-fall': 'Block Fall',
  'escape-classic': 'The Escape (original)',
};

/** A play this short (active seconds) counts as a quick quit. */
export const QUICK_QUIT_SECONDS = 20;

export const PERIODS = [
  { id: 'today', label: 'Today', days: 1 },
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: 'all', label: 'All time', days: null },
] as const;
export type PeriodId = (typeof PERIODS)[number]['id'];

/** Totals for one game on one day. */
export interface DayRow {
  game: string;
  day: string;
  plays: number;
  seconds: number;
  /** Plays under QUICK_QUIT_SECONDS. */
  quick: number;
  /** Plays with at least one finished run. */
  done: number;
}

/** One player played one game on one day. */
export interface PlayerDay {
  game: string;
  playerId: string;
  day: string;
}

export interface Stats {
  plays: number;
  seconds: number;
  avgSeconds: number;
  players: number;
  /** Average daily players over the period's days. */
  avgDau: number;
  /** Share of plays with a finished run, 0..1 (null with no plays). */
  finished: number | null;
  quickQuits: number | null;
  playsPerPlayer: number | null;
  /** Share of the period's players who have played on more than one day, 0..1. */
  returning: number | null;
}

/** The calendar day in Atlantic time (where Ryan is), YYYY-MM-DD. */
export function atlanticDay(at: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Halifax', year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
}

export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** First and last day of a period ending today. "all" starts at the first day with data. */
export function periodRange(period: PeriodId, today: string, firstDay: string | null): { from: string; to: string; days: number } {
  const p = PERIODS.find((x) => x.id === period) ?? PERIODS[2];
  const from = p.days ? addDays(today, -(p.days - 1)) : (firstDay ?? today);
  return { from, to: today, days: daysBetween(from, today) + 1 };
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000);
}

const share = (n: number, of: number) => (of ? n / of : null);

/** Stats for one game (or the whole site with game = null) over [from, to]. */
export function summarize(rows: DayRow[], playerDays: PlayerDay[], range: { from: string; to: string; days: number }, game: string | null): Stats {
  const inGame = <T extends { game: string }>(r: T) => game === null || r.game === game;
  const inRange = (day: string) => day >= range.from && day <= range.to;
  let plays = 0, seconds = 0, quick = 0, done = 0;
  for (const r of rows) {
    if (!inGame(r) || !inRange(r.day)) continue;
    plays += r.plays;
    seconds += r.seconds;
    quick += r.quick;
    done += r.done;
  }
  // Distinct players per day (site-wide counts a player once a day across games), and days per player up to `to`.
  const perDay = new Map<string, Set<string>>();
  const daysOf = new Map<string, Set<string>>();
  for (const r of playerDays) {
    if (!inGame(r) || r.day > range.to) continue;
    if (!daysOf.has(r.playerId)) daysOf.set(r.playerId, new Set());
    daysOf.get(r.playerId)!.add(r.day);
    if (!inRange(r.day)) continue;
    if (!perDay.has(r.day)) perDay.set(r.day, new Set());
    perDay.get(r.day)!.add(r.playerId);
  }
  const players = new Set<string>();
  let dauSum = 0;
  for (const set of perDay.values()) {
    dauSum += set.size;
    set.forEach((p) => players.add(p));
  }
  let returning = 0;
  players.forEach((p) => (daysOf.get(p)!.size > 1 ? returning++ : 0));
  return {
    plays,
    seconds,
    avgSeconds: plays ? seconds / plays : 0,
    players: players.size,
    avgDau: dauSum / Math.max(1, range.days),
    finished: share(done, plays),
    quickQuits: share(quick, plays),
    playsPerPlayer: players.size ? plays / players.size : null,
    returning: share(returning, players.size),
  };
}

/** Daily players across the site for the last `n` days ending at `to`, oldest first. */
export function dauSeries(playerDays: PlayerDay[], to: string, n: number): { day: string; players: number }[] {
  const perDay = new Map<string, Set<string>>();
  for (const r of playerDays) {
    if (!perDay.has(r.day)) perDay.set(r.day, new Set());
    perDay.get(r.day)!.add(r.playerId);
  }
  return Array.from({ length: n }, (_, i) => {
    const day = addDays(to, i - (n - 1));
    return { day, players: perDay.get(day)?.size ?? 0 };
  });
}

/** 3725 -> "1h 2m", 95 -> "1m 35s", 40 -> "40s". */
export function duration(seconds: number): string {
  const s = Math.round(seconds);
  if (s >= 3600) return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  if (s >= 60) return `${Math.floor(s / 60)}m ${s % 60}s`;
  return `${s}s`;
}

export const pct = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}%`);
