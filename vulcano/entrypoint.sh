#!/bin/bash
set -euo pipefail

export GIT_TERMINAL_PROMPT=0

GH_TOKEN="${GH_TOKEN:-}"
if [[ -r /run/secrets/ghtoken ]]; then
  GH_TOKEN="$(< /run/secrets/ghtoken)"
fi

if [[ -n "$GH_TOKEN" ]]; then
  umask 077
  printf 'https://x-access-token:%s@github.com\n' "$GH_TOKEN" > "$HOME/.git-credentials"
  git config --global credential.helper store
  git config --global credential."https://github.com".username x-access-token
fi

exec makepkg "$@"
