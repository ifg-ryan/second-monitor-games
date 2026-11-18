# Vendored skills

Source: https://github.com/mattpocock/skills (MIT, licence copied to `.claude/skills/LICENSE-mattpocock-skills`)
Pinned commit: 5863806dd4e15c63174bee4e7515a4256792ecfa (2026-11-12, plugin version 1.3.2)

Copied unmodified into `.claude/skills/`, minus each skill's Codex-only `agents/openai.yaml`:

- User-invoked: `wayfinder`, `grill-with-docs`, `to-spec`, `improve-codebase-architecture`, `retro`, `handoff`, `wait-what`, `to-questionnaire`, `setup-matt-pocock-skills`
- Model-invoked: `grilling`, `domain-modeling`, `prototype`, `research`, `tdd`, `codebase-design`, `code-review`, `diagnosing-bugs`, `pr`, `wizard`, `writing-for-agents`

Copied and then edited so a non-programmer can check the work:

- `to-tickets`: both ticket templates gain a "How to see it working" section.
- `implement`: ends by running those steps and reporting them to the user.
- `implement-spec`: new step 8 writes a walkthrough of the whole spec before closing out.

Written for this kit:

- `.claude/hooks/git-guardrail.sh`, based on `skills/misc/git-guardrails-claude-code/scripts/block-dangerous-git.sh`. Upstream blocks every push and every hard reset, which stops `wayfinder` (pushes research branches) and `implement-spec` (implementers may reset inside their worktrees). This version protects `main` and `master` and allows the rest.
- `.claude/settings.json`, `WORKFLOW.md`, `install.sh`
- `CLAUDE.md`: the "Who you are working with" rules, plus the Agent skills pointer block
- In `docs/agents/issue-tracker.md`: the `Status:` values and the "When a ticket is finished" section. The rest is the upstream local-tracker template.

Use either these vendored copies or the upstream Claude Code plugin, never both, or every skill appears twice.
