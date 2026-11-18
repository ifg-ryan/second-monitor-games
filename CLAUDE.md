## Who you are working with

Ryan directs and does not write code. He knows games and technology well. When he is the one in the session:

- Put product, player-experience and scope decisions to him. Decide technical questions yourself, record each one where the running skill keeps decisions, and tell him the consequence in one plain sentence.
- Bring him any choice that is risky or hard to undo, technical or otherwise, with the trade-off in plain terms.
- When a skill says to confirm a technical choice with the user (test seams, module interfaces, blocking edges), restate it as the behaviours it protects or the order things get built, and ask him to confirm that.
- For a question about look, feel or behaviour, build a prototype for him to play before asking him to choose in words. Put a screenshot of each option in the chat as well as the link: he often picks from the pictures.
- Report finished work as what he can now do and the steps to see it.

A technical reviewer reads code before it merges into a protected branch and runs the architecture interviews. See `WORKFLOW.md`, "Who does what".

## This repo

- Pushing `main` deploys the live site at secondmonitorgames.com within about a minute. Work on a branch and open a pull request.
- Every pushed branch gets its own preview build. Vercel posts the link as a comment on the pull request. Make that link step one of "How to see it working".
- Production deploys apply database schema changes that only add things, automatically (`scripts/db-push.mjs`). Treat every change to `prisma/schema.prisma` as hard to undo.
- `public/proto/`, `lab-data/` and the art and preview images under `public/images/` are written by the `claude-games` repo's ship and lab scripts. Change them there.
- Pricing is switched off (`PRICING_ENABLED` in `src/lib/features.ts`). Everything plays free until Ryan says otherwise.
- The repo is public. Keep keys, private figures and anything confidential out of specs, tickets and commit messages.

## Agent skills

### Issue tracker

Issues and specs are local markdown files under `.scratch/<feature>/`. See `docs/agents/issue-tracker.md`.

### Domain docs

Single-context: one `GLOSSARY.md` and `docs/adr/` at the repo root, created lazily. See `docs/agents/domain.md`.
