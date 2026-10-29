# Accounts

Players sign in with Google (through Clerk), then pick a username. Guests can still play and post scores under a nickname.

## How it works
- Sign in: `/sign-in` (Clerk, Google only). New and returning players use the same page.
- Username: a signed-in player without one is sent to `/welcome` from any page (`src/proxy.ts` checks a cookie; `/api/user/named` confirms once per browser).
  Usernames are unique regardless of case (`Username` table, key = lowercase name). Players can change theirs any time on `/account`; their leaderboard rows are renamed.
- Ban list: `src/lib/usernames.ts`, used for usernames and guest nicknames. The big list is generated (`npm run banlist`, needs the claude-games repo next to this one).
  Hand edits go in `src/lib/banlist-extra.ts`. Tests: `src/lib/__tests__/usernames.test.ts`.
- Guest claim: after picking a username, `/welcome` sends this browser's guest id and every game's guest achievements to `/api/user/claim-guest`.
  Guest leaderboard rows move to the account (better score kept, plays added), play stats move, site achievements are re-checked. Once per account (User.guestClaimedAt).
- Delete account: `/account` (checkbox, then the button). Removes scores, achievements, play stats, username and the Clerk user. The Clerk webhook (`user.deleted`) does the same when an account is deleted from the Clerk dashboard.

## Cloud save
A signed-in player's saved progress in each kit game follows them to any device.
- Stored in `GameSave` (one row per player per game, JSON of the game's saved keys, 256 KB cap) through `/api/kit/save`.
- Each write names the revision it started from; if another device saved first the write is refused (409) and the kit merges on the next start.
  All merge rules live in the kit (claude-games `kit/core/CloudSave.ts`, `kit/site/CloudSync.ts`); the site only stores.
- `/play/<id>` (KitGameFrame) fetches the save and puts it aside in the browser before the game loads, so the game starts with it.
- Kept on the device: tuning-panel overrides and any `localOnly` keys in a game's game.json.

## Account XP
- Every achievement is worth XP: `xp` in the game's game.json (default 50); site-wide ones in `src/lib/siteAchievements.ts`.
- A player's XP is the total of the achievements on their account (`src/lib/xp.ts`); nothing separate to keep in step.
- Levels: reaching level n takes 20 x (n - 1)^2 XP. Level 20 is 7,220 XP.
- Shown in the header (Lv badge), on /account (level, XP bar, XP and progress per achievement) and next to names on leaderboards.
  Games get the level from /api/kit/me and a level-up flag from /api/kit/achievements and /api/kit/score.

## Setup (done once)
1. Clerk: create the production instance for secondmonitorgames.com and add its DNS records.
2. Clerk, User and authentication: turn on Google; turn off email, phone, username and every other provider.
3. Google Cloud: create an OAuth client (web), add Clerk's redirect URL, paste the client id and secret into Clerk's Google settings.
4. Clerk, Webhooks: endpoint `https://secondmonitorgames.com/api/webhooks/clerk`, events `user.created` and `user.deleted`; copy the signing secret.
5. Vercel, Production env: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY` (production keys), `CLERK_WEBHOOK_SECRET`.
6. If the Clerk production frontend is not `clerk.secondmonitorgames.com`, update the CSP in `next.config.ts`.

## Database changes for previews
Production deploys add new tables and columns on their own (scripts/db-push.mjs). Vercel previews skip that step,
so to test a preview against the same database first run this once in the Neon SQL console (it only adds things):

```sql
CREATE TABLE IF NOT EXISTS "Username" ("key" TEXT NOT NULL, "userId" TEXT NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, CONSTRAINT "Username_pkey" PRIMARY KEY ("key"));
CREATE UNIQUE INDEX IF NOT EXISTS "Username_userId_key" ON "Username"("userId");
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "guestClaimedAt" TIMESTAMP(3);
CREATE TABLE IF NOT EXISTS "GameSave" ("id" TEXT NOT NULL, "userId" TEXT NOT NULL, "game" TEXT NOT NULL, "rev" INTEGER NOT NULL DEFAULT 0, "data" TEXT NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP(3) NOT NULL, CONSTRAINT "GameSave_pkey" PRIMARY KEY ("id"));
CREATE UNIQUE INDEX IF NOT EXISTS "GameSave_userId_game_key" ON "GameSave"("userId", "game");
```

## Wipe of development-era accounts (Oct 2026)
Run in the Neon SQL console when switching to Clerk production. Guest scores and guest play stats stay.

```sql
DELETE FROM "Achievement";
DELETE FROM "KitScore" WHERE "playerId" NOT LIKE 'guest:%';
DELETE FROM "Play" WHERE "playerId" NOT LIKE 'guest:%';
DELETE FROM "Subscription";
DELETE FROM "User";
DELETE FROM "Username";
DELETE FROM "GameSave";
```
