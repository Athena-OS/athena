#!/bin/bash
set -euo pipefail

export GIT_TERMINAL_PROMPT=0

GH_TOKEN="${GH_TOKEN:-}"
if [[ -r /run/secrets/ghtoken ]]; then
  GH_TOKEN="$(< /run/secrets/ghtoken)"
fi

if [[ -n "$GH_TOKEN" ]]; then
  export GIT_CONFIG_COUNT=1
  export GIT_CONFIG_KEY_0="url.https://${GH_TOKEN}@github.com/.insteadOf"
  export GIT_CONFIG_VALUE_0="https://github.com/"
fi

exec makepkg "$@"
