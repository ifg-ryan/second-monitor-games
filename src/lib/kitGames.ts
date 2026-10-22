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

export interface KitGame {
  id: string;
  title: string;
  blurb: string;
  tag: string;
  minutes?: [number, number];
  accent?: string;
  icon?: string;
  preview?: string;
  updated?: string;
  /** First shipped. Sorts the front page, so re-shipping a fix doesn't reorder it. */
  added?: string;
  score: { label: string; max: number; lowerIsBetter?: boolean };
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
