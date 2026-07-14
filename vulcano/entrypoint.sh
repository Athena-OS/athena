#!/bin/bash
set -euo pipefail

export GIT_TERMINAL_PROMPT=0

GH_TOKEN="${GH_TOKEN:-}"
if [[ -r /run/secrets/ghtoken ]]; then
  GH_TOKEN="$(< /run/secrets/ghtoken)"
fi

echo "DEBUG: GH_TOKEN length: ${#GH_TOKEN}"
echo "DEBUG: HOME=$HOME USER=$(id -un)"

if [[ -n "$GH_TOKEN" ]]; then
  export GH_TOKEN
  git config --global credential.helper \
    '!f() { echo username=x-access-token; echo password=$GH_TOKEN; }; f'
  echo "DEBUG: helper -> $(git config --global --get credential.helper)"
fi

exec makepkg "$@"
