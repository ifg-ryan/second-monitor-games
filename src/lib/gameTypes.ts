// Game types (one per game) and tags (cross-cutting) for the front-page filter.
// Kit games set them in claude-games games/<id>/game.json ("type", "tags"); the lists
// there live in kit/site/gameTypes.ts. Keep the two in step when adding one.

export const GAME_TYPES = [
  { id: 'word',     name: 'Word' },
  { id: 'puzzle',   name: 'Puzzle' },
  { id: 'card',     name: 'Card' },
  { id: 'arcade',   name: 'Arcade' },
  { id: 'sports',   name: 'Sports' },
  { id: 'strategy', name: 'Strategy' },
] as const;

export const GAME_TAGS = [
  { id: 'daily',     name: 'Daily' },
  { id: 'roguelite', name: 'Roguelite' },
  { id: 'classic',   name: 'Classics' },
] as const;

export type GameType = (typeof GAME_TYPES)[number]['id'];
export type GameTag = (typeof GAME_TAGS)[number]['id'];

/** Card edge colour by game type, from the Iron Fox tri-colour (front page and leaderboard cards). */
export const TYPE_STRIPE: Record<string, string> = {
  arcade: 'var(--accent)', strategy: 'var(--accent)',
  card: 'var(--accent-red)', puzzle: 'var(--accent-red)',
  sports: 'var(--accent-blue)', word: 'var(--accent-blue)',
};
export const typeStripe = (type?: string): string => TYPE_STRIPE[type ?? ''] ?? 'var(--accent)';
