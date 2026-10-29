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
```
