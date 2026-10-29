// Reads what this browser saved while playing as a guest (same site, so the games' saved data is
// visible here): the guest id, the nickname, and every game's unlocked achievements.
// Keys are written by the kit's Storage: "shared:<key>" for shared values, "<game id>:site" for each game.
export function guestProgress(): { guestId: string | null; nickname: string | null; unlocks: Record<string, string[]> } {
  const out = { guestId: null as string | null, nickname: null as string | null, unlocks: {} as Record<string, string[]> };
  let ls: Storage;
  try {
    ls = window.localStorage;
  } catch {
    return out;
  }
  const read = (k: string) => {
    try {
      return JSON.parse(ls.getItem(k) ?? 'null');
    } catch {
      return null;
    }
  };
  const id = read('shared:smg-guest');
  out.guestId = typeof id === 'string' ? id : null;
  const nick = read('shared:smg-nickname');
  out.nickname = typeof nick === 'string' ? nick : null;
  for (let i = 0; i < ls.length; i++) {
    const k = ls.key(i);
    if (!k || !k.endsWith(':site') || k.startsWith('shared:')) continue;
    const v = read(k);
    const ids = v && typeof v === 'object' && v.unlocked && typeof v.unlocked === 'object' ? Object.keys(v.unlocked) : [];
    if (ids.length) out.unlocks[k.slice(0, -':site'.length)] = ids;
  }
  return out;
}
