#!/usr/bin/env bash
# release-merged.sh - runs when an auto-update PR is merged
# (workflow auto-update-release.yml). Uploads the packages that the original
# run built, but only for PKGBUILDs that reached main exactly as built.
# Anything changed during review, or whose build artifacts expired, goes to
# lists/to-release for the normal manual flow.
#
# Env: PR_NUMBER RESULTS PKGS GH_TOKEN GH_REPO + release env (lib-release.sh)
set -euo pipefail
here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib-release.sh
. "$here/lib-release.sh"

released=false release_error=""
BASE_BRANCH=${BASE_BRANCH:-main}
mkdir -p "$RESULTS" "$PKGS"
RESULTS=$(realpath "$RESULTS") PKGS=$(realpath "$PKGS")
export PKGS
unpack_pkgs || { echo "cannot unpack the built packages"; exit 1; }
comment=$(mktemp)
git config --global --add safe.directory "$PWD"
git config user.name  "athena-ci[bot]"
git config user.email "info@athenaos.org"
git fetch -q origin "$BASE_BRANCH"
git checkout -q -B "$BASE_BRANCH" "origin/$BASE_BRANCH"
# <name> -> real directory of every package on the base branch (nested layout)
declare -A PKGDIR
while IFS= read -r f; do d=${f%/PKGBUILD}; PKGDIR[${d##*/}]=$d; done < <(find "${PKG_ROOT:-src}" -name PKGBUILD -not -path '*/.*')

# ---- a merged remove/* PR: remove the listed packages from the repo
if [[ ${HEAD_REF:-} == remove/* ]]; then
  marker=$(printf '%s\n' "${PR_BODY:-}" | sed -nE 's/.*<!-- remove-packages: ([^>]*) -->.*/\1/p' | head -n1)
  marker=$(printf '%s' "$marker" | tr -cs 'A-Za-z0-9._+@=,-' ' ')
  [[ -n $marker ]] || { echo "no remove-packages marker in the PR body"; exit 1; }
  # The marker was written when the PR was opened and the body is editable:
  # only remove what this PR really deleted (PKGBUILD removed in the merged
  # diff) and what is really gone from the base branch after the merge.
  mapfile -t deleted < <(
    gh api --paginate "repos/$GH_REPO/pulls/$PR_NUMBER/files" -q '.[] | select(.status == "removed") | .filename' |
      sed -nE 's|^(.*/)?([^/]+)/PKGBUILD$|\2|p' | sort -u)
  names="" kept=""
  for item in $marker; do
    dir=${item%%=*}; list=${item#*=}
    [[ $item == *=* ]] || { dir=$item; list=$item; }      # old marker format: names only
    if printf '%s\n' "${deleted[@]}" | grep -qxF -- "$dir" && [[ -z ${PKGDIR[$dir]:-} ]]; then
      names+=" ${list//,/ }"
    else
      kept+=" ${list//,/ }"
    fi
  done
  names=${names# }; kept=${kept# }
  [[ -z $kept ]] || echo "::warning::not removed from the repo (restored during review or still in the tree): $kept"
  if [[ -z $names ]]; then
    echo "ℹ️ Nothing removed from the package repository: the packages are still in the tree ($kept)." > "$comment"
    gh pr comment "$PR_NUMBER" --body-file "$comment" || true
    exit 0
  fi
  rc=0
  # shellcheck disable=SC2086
  if release_setup && remove_packages $names; then
    echo "✅ Removed from the package repository: $names" > "$comment"
    [[ -z $kept ]] || echo "Not removed (still in the tree after the merge): $kept" >> "$comment"
  else
    rc=1; echo "⚠️ Could not remove from the package repository: ${release_error:-unknown error}. Packages: $names" > "$comment"
  fi
  gh pr comment "$PR_NUMBER" --body-file "$comment" || true
  exit "$rc"
fi

[[ -z ${PR_BASE_SHA:-} ]] || git fetch -q --depth=1 origin "$PR_BASE_SHA" 2>/dev/null || true
mapfile -t changed < <(
  gh api --paginate "repos/$GH_REPO/pulls/$PR_NUMBER/files" -q '.[].filename' |
    sed -nE 's|^(.*/)?([^/]+)/PKGBUILD$|\2|p' | sort -u)

ship=() manual=()
for pkg in "${changed[@]}"; do
  dir=${PKGDIR[$pkg]:-}
  # PKGBUILD must be the built one, and nothing else in the directory (patches,
  # .install files) may have changed since the PR's base commit: a reviewer's
  # fix in the PR, or another commit on the base branch, was never built
  if [[ -n $dir && -f $dir/PKGBUILD && -f $RESULTS/$pkg/PKGBUILD ]] &&
     git diff --no-index --quiet "$dir/PKGBUILD" "$RESULTS/$pkg/PKGBUILD" &&
     { [[ -z ${PR_BASE_SHA:-} ]] || git diff --quiet "$PR_BASE_SHA" HEAD -- "$dir" ":(exclude)$dir/PKGBUILD"; } &&
     compgen -G "$PKGS/$pkg/*.pkg.tar.zst" >/dev/null; then
    ship+=("$pkg")
  elif [[ -n $dir && -f $dir/PKGBUILD ]]; then
    manual+=("$pkg")
  fi
done
echo "release: ${#ship[@]}  manual: ${#manual[@]}"

rc=0
release_packages "${ship[@]}" || rc=1
if (( ${#manual[@]} )); then
  queue_for_humans "auto-update PR #$PR_NUMBER: changed in review or artifacts expired" \
    "${manual[@]}" || rc=1
fi

{
  if [[ $released == true ]]; then
    echo "✅ Released ${#ship[@]} packages to the repo."
  elif (( ${#ship[@]} )); then
    echo "⚠️ Packages were not released: ${release_error:-unknown error}"
  fi
  if (( ${#manual[@]} )); then
    echo
    echo "Added to \`lists/to-release\` (changed during review or build artifacts expired):"
    printf -- '- `%s`\n' "${manual[@]}"
  fi
} > "$comment"
[[ -s $comment ]] && gh pr comment "$PR_NUMBER" --body-file "$comment" || true
exit "$rc"
