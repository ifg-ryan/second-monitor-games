// Kept for older callers. The filter now lives in src/lib/usernames.ts (generated ban list).
import { isBannedName } from './usernames';

/** True if the name contains a banned word. */
export function containsBadWord(name: string): boolean {
  return isBannedName(name);
}
