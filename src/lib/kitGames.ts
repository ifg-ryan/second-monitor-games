// Games built with the Claude Games kit, from public/proto/games.json.
// `npm run ship` in the claude-games repo writes that file: each game's title,
// blurb, score rules and achievements (from games/<id>/game.json there).
import data from '../../public/proto/games.json';

export interface KitAchievement {
  id: string;
  name: string;
  description: string;
  goal?: number;
  secret?: boolean;
}

export interface KitBoard {
  id: string;
  name: string;
}

export interface KitGame {
  id: string;
  title: string;
  blurb: string;
  tag: string;
  /** Main category, see src/lib/gameTypes.ts. */
  type?: string;
  tags?: string[];
  minutes?: [number, number];
  accent?: string;
  icon?: string;
  preview?: string;
  updated?: string;
  /** claude-games commit the shipped build came from. */
  source?: string;
  /** First shipped. Sorts the front page, so re-shipping a fix doesn't reorder it. */
  added?: string;
  /** `boards`: separate leaderboards inside one game (Putt Party's courses). Scores are stored under "<game id>:<board id>". */
  score: { label: string; max: number; lowerIsBetter?: boolean; boards?: KitBoard[] };
  achievements: KitAchievement[];
}

type Entry = Partial<KitGame> & { title: string };

/** Every shipped kit game that has a leaderboard (entries without score rules, like the Kit Explorer, are left out). */
export const KIT_GAMES: KitGame[] = Object.entries(data as unknown as Record<string, Entry>)
  .filter(([, g]) => g.score && g.blurb)
  .map(([id, g]) => ({ ...(g as KitGame), id, achievements: g.achievements ?? [] }))
  .sort((a, b) => (b.added ?? b.updated ?? '').localeCompare(a.added ?? a.updated ?? ''));

export function kitGame(id: string | null | undefined): KitGame | undefined {
  return KIT_GAMES.find((g) => g.id === id);
}

/** The game's page on the site (site bar, info bar, game). */
export function kitUrl(id: string): string {
  return `/play/${id}`;
}

/** The game file on its own (no site around it). */
export function kitFile(id: string): string {
  return `/proto/${id}.html`;
}

/** One leaderboard: its storage key and, for games with several, its name. */
export interface BoardRef {
  key: string;
  name: string | null;
  id: string | null;
}

/** Every leaderboard a game has: one per board, or the single game board. */
export function kitBoards(g: KitGame): BoardRef[] {
  const boards = g.score.boards;
  return boards?.length ? boards.map((b) => ({ key: `${g.id}:${b.id}`, name: b.name, id: b.id })) : [{ key: g.id, name: null, id: null }];
}

/** Storage key for a score, or null when the board doesn't fit the game (missing, unknown, or given to a one-board game). */
export function boardKey(g: KitGame, board: string | null | undefined): string | null {
  const boards = g.score.boards;
  if (!boards?.length) return board ? null : g.id;
  return board && boards.some((b) => b.id === board) ? `${g.id}:${board}` : null;
}

/** The game id a stored score key belongs to. */
export const gameOfKey = (key: string) => key.split(':')[0];
