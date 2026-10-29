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
