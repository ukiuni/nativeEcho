#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/create_and_push_repo.sh [OWNER/REPO]
# If no arg provided, uses ukiuni/nativeEcho

REPO=${1:-ukiuni/nativeEcho}

echo "Repository: $REPO"

if ! command -v gh >/dev/null 2>&1; then
  echo "Error: gh CLI not found. Install from https://github.com/cli/cli#installation"
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "You are not authenticated with GitHub. Run: gh auth login"
  exit 1
fi

if [ ! -d .git ]; then
  echo "Initializing a new git repository..."
  git init
fi

echo "Adding files and committing..."
git add --all
if git commit -m "Initial commit from create_and_push_repo.sh"; then
  echo "Committed changes."
else
  echo "No changes to commit or commit failed (continuing)."
fi

echo "Checking remote repository existence..."
if gh repo view "$REPO" >/dev/null 2>&1; then
  echo "Remote repository $REPO already exists. Configuring remote and pushing..."
  git remote remove origin 2>/dev/null || true
  # Prefer SSH if user has it set up; fall back to HTTPS
  if git remote add origin "git@github.com:${REPO}.git" 2>/dev/null; then
    echo "Added SSH remote origin."
  else
    git remote add origin "https://github.com/${REPO}.git"
    echo "Added HTTPS remote origin."
  fi
  git branch -M main || true
  git push -u origin main
  echo "Pushed to existing repo $REPO."
else
  echo "Creating repository $REPO and pushing source..."
  # This will create the repo under authenticated user/org
  gh repo create "$REPO" --public --source=. --remote=origin --push
  echo "Created and pushed to $REPO."
fi

echo "Done. View: https://github.com/${REPO}"
