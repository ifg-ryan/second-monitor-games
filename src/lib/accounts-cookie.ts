// Name of the cookie that lets a signed-in player past the "pick a username" check.
// Its own file so the page check (src/proxy.ts) doesn't pull in the database client.
export const NAMED_COOKIE = 'smg_named';
