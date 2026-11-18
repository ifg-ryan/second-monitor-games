#!/bin/bash
# PreToolUse hook for the Bash tool. Blocks git commands that destroy work or
# touch a protected branch, while leaving room for parallel implementer agents
# (feature-branch pushes, resets inside their own worktrees).
#
# Based on block-dangerous-git.sh from mattpocock/skills (MIT), which blocks
# every push and every hard reset. Exit 2 blocks the command and shows the
# message to the agent.
#
# This is a seatbelt. Branch protection on the git host is the real lock.

PROTECTED_BRANCHES="${PROTECTED_BRANCHES:-main master}"

INPUT=$(cat)
COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
CWD=$(echo "$INPUT" | jq -r '.cwd // empty')
[ -n "$CWD" ] && [ -d "$CWD" ] || CWD="."

block() {
  echo "BLOCKED: $1 The user has prevented you from doing this. Command: $COMMAND" >&2
  exit 2
}

matches() { echo "$COMMAND" | grep -qE -- "$1"; }

# 1. Always blocked: these throw away uncommitted or unmerged work.
matches 'git clean +-[a-zA-Z]*f'            && block "git clean -f deletes untracked files."
matches 'git checkout +(-- +)?\.( |$)'      && block "git checkout . discards uncommitted changes."
matches 'git restore +(-- +)?\.( |$)'       && block "git restore . discards uncommitted changes."
matches 'git branch +(.* )?-D( |$)'         && block "git branch -D deletes unmerged branches."

# 2. Push: allowed for ordinary branches, never forced, never to a protected branch.
if matches 'git +(-[cC] +[^ ]+ +)*push( |$)'; then
  matches ' (--force|--force-with-lease|--force-if-includes|-f|--mirror|--all)( |=|$)' \
    && block "Force, mirror and all-branch pushes are not allowed."
  matches ' \+[^ ]+' && block "Force-push refspecs (+ref) are not allowed."
  current=$(git -C "$CWD" symbolic-ref --short -q HEAD 2>/dev/null)
  for b in $PROTECTED_BRANCHES; do
    matches "(^|[ :/])$b( |:|$)" && block "Pushing to $b is not allowed. Push a feature branch."
    [ "$current" = "$b" ]        && block "You are on $b. Pushing from $b is not allowed."
  done
fi

# 3. Hard reset: only inside a linked worktree, where an implementer agent owns the branch.
if matches 'reset +(.* )?--hard'; then
  matches '(^|[;&| ])cd |git +-C ' && block "git reset --hard combined with a directory change is not allowed."
  git_dir=$(git -C "$CWD" rev-parse --absolute-git-dir 2>/dev/null)
  common_dir=$(cd "$CWD" 2>/dev/null && cd "$(git rev-parse --git-common-dir 2>/dev/null)" 2>/dev/null && pwd -P)
  if [ -z "$git_dir" ] || [ -z "$common_dir" ] || [ "$git_dir" = "$common_dir" ]; then
    block "git reset --hard is only allowed inside a linked worktree."
  fi
fi

exit 0
