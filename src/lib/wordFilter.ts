/**
 * Username word filter
 * Blocks profanity, slurs, and hate-group references.
 * Case-insensitive, and also catches common l33t substitutions.
 */

// Normalize l33t-speak before checking (e→e, 3→e, 1→i, etc.)
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/8/g, "b")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/!/g, "i")
    .replace(/\+/g, "t")
    .replace(/[^a-z]/g, ""); // strip remaining non-alpha
}

// Core blocked terms — stored normalized (lowercase, no numbers/symbols)
// This list covers common English profanity, slurs, and hate references.
const BLOCKED: string[] = [
  // Sexual
  "ass", "asses", "asshole", "assholes",
  "bastard", "bastards",
  "bitch", "bitches",
  "cock", "cocks", "cocksucker",
  "cum", "cums",
  "cunt", "cunts",
  "dick", "dicks",
  "dildo", "dildos",
  "fag", "fags", "faggot", "faggots",
  "fuck", "fucker", "fuckers", "fucking", "fucks",
  "gangbang",
  "handjob",
  "horny",
  "jizz",
  "kink",
  "masturbat",
  "milf",
  "nipple", "nipples",
  "orgasm",
  "penis", "penises",
  "porn", "porno",
  "pussy", "pussies",
  "rape", "rapist",
  "sex", "sexy",
  "shit", "shits", "shitting",
  "slut", "sluts",
  "tit", "tits", "titties",
  "twat", "twats",
  "vagina",
  "whore", "whores",
  // Racial / ethnic slurs
  "chink", "chinks",
  "coon", "coons",
  "gook", "gooks",
  "kike", "kikes",
  "negro", "negros",
  "nigga", "niggas",
  "nigger", "niggers",
  "redskin",
  "spic", "spics",
  "towelhead",
  "wetback",
  "zipperhead",
  // Hate group references
  "kkk",
  "nazi", "nazis",
  "neonazi",
  "whitepride",
  "whitepower",
  "skinhead",
  "hitleryouth",
  "aryanbrotherhood",
  // Religious / other slurs
  "retard", "retards",
  "tranny", "trannies",
];

// Pre-normalise the blocklist once at module load
const BLOCKED_NORMALIZED = BLOCKED.map(normalize);

/**
 * Returns true if the username contains a blocked word after normalisation.
 * Substring matching — "fuckyou" would match "fuck".
 */
export function containsBadWord(username: string): boolean {
  const n = normalize(username);
  return BLOCKED_NORMALIZED.some((bad) => n.includes(bad));
}
