#!/bin/bash
set -euo pipefail

export GIT_TERMINAL_PROMPT=0

[[ -f /run/secrets/ghtoken ]] && GH_TOKEN="$(< /run/secrets/ghtoken)"

if [[ -n "${GH_TOKEN:-}" ]]; then
  export GH_TOKEN
  git config --global credential.helper \
    '!f() { echo username=x-access-token; echo password=$GH_TOKEN; }; f'
fi

exec makepkg "$@"
