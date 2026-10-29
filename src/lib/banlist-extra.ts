// Hand edits to the username and nickname ban list (the big list is generated: npm run banlist).
// Add a word here and it applies on the next deploy. Lowercase letters only.

/** Banned anywhere in a name, even inside another word. Use for slurs and hard words. */
export const EXTRA_ANYWHERE: string[] = ['kunt', 'fvck', 'phuck', 'phuk', 'fukk', 'fuq'];

/** Banned as a whole word, or at the start or end of a run of letters (4+ letters). */
export const EXTRA_WORDS: string[] = [];

/** Names (or words inside names) that the filter blocks by mistake and should be allowed. */
export const EXTRA_ALLOWED: string[] = ['scunthorpe', 'hancock', 'cockburn', 'dickson', 'dickinson', 'babcock', 'hitchcock', 'shitake', 'nazir', 'nazira', 'nazareth', 'nazarene'];

/** Names nobody may take: staff-looking names and words the site uses itself. Checked as whole names and as the start of a name. */
export const RESERVED_PREFIXES: string[] = ['admin', 'moderator', 'secondmonitor', 'ironfox'];
