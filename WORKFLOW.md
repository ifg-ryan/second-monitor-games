# Harness workflow

The operating card for this repo's agent harness. Skills live in `.claude/skills/` and come from [mattpocock/skills](https://github.com/mattpocock/skills) (MIT), vendored so they can be edited here.

## How work goes live in this repo

1. The agent works on a branch and pushes it. The git guardrail stops it pushing `main`.
2. The agent opens a pull request with a picture of the change, before-and-after evidence and a risk call.
3. You follow the "How to see it working" steps.
4. Pressing **Merge** on the pull request at github.com puts it live. That is the Approve button.

## Who does what

| Decision or check | Ryan | Agent | Technical reviewer |
|---|---|---|---|
| What to build, for whom, what is out of scope | Decides | Asks, recommends | |
| How it looks, feels and behaves | Decides by playing prototypes | Builds the variants | |
| Project vocabulary (`GLOSSARY.md`) | Owns the terms | Challenges fuzzy ones, writes them down | |
| Technical design: test boundaries, module shape, ticket order | Confirms the behaviours being protected | Decides, records, explains the consequence | Spot-checks |
| Anything risky or hard to undo | Decides, with the trade-off in plain terms | Raises it | Advises |
| Is a ticket done | Follows its "How to see it working" steps | Runs those steps first and reports what happened | |
| Merge into `main` | | Opens the request with evidence and a risk call | Reads the code and merges |
| Architecture clean-up (step 5a) | Picks from the report if he wants | Produces the report | Runs the redesign interview |

Technical reviewer: _name them here_.

When an answer goes over your head, type `/wait-what`. The agent re-explains in plain English using the project's own terms.

## Building v1 of something new

| Step | You type | What happens | What it leaves behind |
|------|----------|--------------|-----------------------|
| 1. Explore the idea | `/wayfinder <idea>` | First session charts a map: names the destination, then lists the open decisions as tickets with blocking edges. Research tickets start in background agents straight away. | `.scratch/<effort>/map.md`, `.scratch/<effort>/issues/` |
| | `/wayfinder <map>` | Every later session resolves one decision ticket, then stops. Ticket types: grilling (an interview with you), prototype, research, task. Unblocked tickets can run in parallel sessions. | Answers on tickets, `GLOSSARY.md` terms, ADRs in `docs/adr/` |
| 2. Play with variants | happens inside step 1 | A prototype ticket calls the `prototype` skill: 3 structurally different UI variants behind a switcher, or one clickable HTML file for a state or logic question. You can also ask for a prototype directly at any time. | `prototype/<name>` branch, verdict on the ticket |
| 3. Spec the outcome | `/to-spec`, then `/to-tickets` | Collapses the map's decisions into one spec, checks the test seams with you, then cuts the spec into vertical slices with blocking edges. Every ticket ends with "How to see it working" steps. Run both in one session. | `.scratch/<feature>/spec.md`, `.scratch/<feature>/issues/` |
| 4. Parallel build | `/implement-spec <spec>` | Reads the tickets as a task graph. One implementer subagent per ready ticket, each in its own git worktree, each building test-first. A merger subagent lands finished tickets on one integration branch, which unblocks the next wave. One two-axis code review at the end, then a walkthrough of the whole feature that the agent has run itself. | An integration branch with every ticket done, plus the walkthrough |

## The loop after v1

- **5a. Keep entropy down:** `/improve-codebase-architecture` every few days. It scans recently changed code for shallow, tangled modules and opens an HTML report of candidates. Pick one, get interviewed on the redesign, and the result becomes a feature for 5b.
- **5b. New sub-features:** `/grill-with-docs` to settle the design, `/to-spec`, `/to-tickets`, then `/implement-spec` to hand it to parallel implementers. For a change that fits in one session, `/implement` does it in place.
- **After any session, good or bad:** `/retro` before clearing. It proposes changes to the harness: new automated checks, new review rules, leaner steering files.

`/wayfinder` is for efforts too large and unclear for one session. If its first interview finds nothing unclear, it stops and says so. Use `/grill-with-docs` for those.

## Before running parallel agents

Step 4 is only as good as the checks each implementer runs. The repo needs a typecheck or build command and a test command that run from the terminal and finish in seconds to a few minutes. Without them, parallel agents produce unverified code faster.

How parallel step 4 gets is decided in step 3: tickets with no blockers run at once, chains run in sequence.

## Side entrances

- **Something is broken:** say "diagnose this" or type `/diagnosing-bugs`. It builds one command that fails on the bug before it theorises, then fixes with a regression test.
- **A question needs reading:** ask for research. A background agent reads primary sources and leaves a cited markdown file in the repo.
- **A decision needs someone else's knowledge:** `/to-questionnaire` writes a short list of questions for that one person, to fill in on their own time or in a meeting.
- **Setup only a human can do** (accounts, keys, third-party dashboards): the agent writes a wizard script that opens each page, says what to click, and stores each value where it belongs.
- **Moving the work somewhere else** (another tool, another repo, a colleague): `/handoff`.

## Context rules

- At the end of a phase, ask in order: can I continue here, is this context disposable (`/clear`), does the work need to travel (`/handoff`), can a subagent do it unattended. If none apply, `/compact` with a note on what comes next.
- Decide at the boundary between phases. Mid-phase, keep going.
- Keep `/to-spec` and `/to-tickets` in the same session as the thinking they build on.

## Guardrails

`.claude/hooks/git-guardrail.sh` runs before every shell command the agent issues. It needs `jq`.

| Blocked | Allowed |
|---------|---------|
| Any push to or from `main` or `master` | Pushing feature, research and prototype branches |
| Force pushes, `--all`, `--mirror` | Commits, merges, worktree add and remove |
| `git reset --hard` in the main checkout | `git reset --hard` inside a linked worktree |
| `git clean -f`, `git checkout .`, `git restore .`, `git branch -D` | `git branch -d` on merged branches |

Set `PROTECTED_BRANCHES` to change the protected list. Turn on branch protection on the git host as well. The hook matches command text, so it is a seatbelt.

Coding standards are enforced at review by `code-review`, from `CODING_STANDARDS.md` once that file exists. Mechanical rules belong in a linter, pre-commit hook or CI job. `/retro` feeds both.

## Changing the setup

- Switch issue tracker (GitHub, GitLab, Jira, Linear): run `/setup-matt-pocock-skills`. On GitHub the wayfinder map and its tickets become real issues with native blocking links, visible to the whole team.
- Editing or adding a skill: the `writing-for-agents` skill is the style guide.
- Merge requests follow the `pr` skill: a picture of the change, before-and-after evidence, and whether the merge can be undone and how much it touches.
- Not vendored yet: `triage` (incoming issues from other people). Add with `npx skills@latest add mattpocock/skills --skill=triage`.
