#!/usr/bin/env bash
# publish.sh - hand successfully built updates over, in one of two modes:
#
#   PUBLISH_MODE=push  check the release secrets, commit to main, push,
#                      then release right away to the R2 repo
#   PUBLISH_MODE=pr    commit to a branch and open ONE pull request for the
#                      whole run; release-merged.sh uploads the packages when
#                      that PR is merged (workflow auto-update-release.yml)
#
# Runs in the publish job (archlinux container, repo checked out, as root).
# Env:
#   BASE_SHA            commit the run started from (detect job)
#   RESULTS PKGS        downloaded results/ and pkgs/ artifact dirs
#   PUBLISH_OUT         where to write publish.json for the report
#   RUN_ID RUN_URL      this workflow run
#   GH_TOKEN GH_REPO    for `gh pr create` (pr mode)
#   + release env, see lib-release.sh (push mode)
set -euo pipefail
here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
# shellcheck source=lib-release.sh
. "$here/lib-release.sh"

MODE=${PUBLISH_MODE:-push}
BASE_BRANCH=${BASE_BRANCH:-main}
# <name> -> real directory (nested layout), written by pkgtree.sh
declare -A PKGDIR
while read -r n d; do [[ -n $n ]] && PKGDIR[$n]=$d; done < "${PKGMAP:?PKGMAP (pkgtree map) not set}"
[[ $MODE == push || $MODE == pr ]] || { echo "unknown PUBLISH_MODE '$MODE'"; exit 1; }
mkdir -p "$RESULTS" "$PKGS" "$(dirname "$PUBLISH_OUT")"
RESULTS=$(realpath "$RESULTS") PKGS=$(realpath "$PKGS")
PUBLISH_OUT=$(realpath -m "$PUBLISH_OUT")
export PKGS
unpack_pkgs || { echo "cannot unpack the built packages"; exit 1; }

committed=() skipped=() released=false release_error="" pr_url=""
write_out() {
  jq -n --arg mode "$MODE" --arg pr_url "$pr_url" \
        --argjson committed "$(printf '%s\n' "${committed[@]}" | jq -R . | jq -sc 'map(select(. != ""))')" \
        --argjson skipped "$(printf '%s\n' "${skipped[@]}" | jq -R . | jq -sc 'map(select(. != ""))')" \
        --argjson released "$released" --arg release_error "$release_error" \
        '{mode:$mode, pr_url:$pr_url, committed:$committed, skipped:$skipped,
          released:$released, release_error:$release_error}' > "$PUBLISH_OUT"
}
trap write_out EXIT

# ------------------------------------------------------------------ select
# status.json was rewritten on the runner host by verify-output.py; the
# package name is the directory name, never a value from the build container
ok=()
for d in "$RESULTS"/*/; do
  pkg=$(basename "$d")
  [[ -f $d/status.json ]] || continue
  [[ $(jq -r '.result + "/" + .kind' "$d/status.json") =~ ^ok/(release|vcs|rebuild)$ ]] || continue
  ok+=("$pkg")
done
echo "built OK: ${#ok[@]}  (mode: $MODE)"
(( ${#ok[@]} )) || exit 0

git config --global --add safe.directory "$PWD"
git config user.name  "athena-ci[bot]"
git config user.email "info@athenaos.org"
git fetch --quiet origin "$BASE_BRANCH"
git fetch --quiet --depth=1 origin "$BASE_SHA" 2>/dev/null || true

todo=()
for pkg in "${ok[@]}"; do
  dir=${PKGDIR[$pkg]:-}
  if [[ -z $dir || ! -d $dir ]]; then
    skipped+=("$pkg: no such package on $BASE_BRANCH"); continue
  fi
  if [[ ! -f $RESULTS/$pkg/PKGBUILD ]] || ! compgen -G "$PKGS/$pkg/*.pkg.tar.zst" >/dev/null; then
    skipped+=("$pkg: build artifacts missing"); continue
  fi
  if ! git diff --quiet "$BASE_SHA" "origin/$BASE_BRANCH" -- "$dir"; then
    skipped+=("$pkg: changed on $BASE_BRANCH during the run"); continue
  fi
  todo+=("$pkg")
done

# push mode: make sure the upload can work BEFORE anything reaches the base branch
if [[ $MODE == push && ${RELEASE:-true} == true && ${#todo[@]} -gt 0 ]]; then
  if ! release_setup; then
    release_error="not published: $release_error"
    echo "$release_error"
    exit 1
  fi
fi

# ------------------------------------------------------------------ commit
if [[ $MODE == pr ]]; then
  branch="auto-update/$(date -u +%Y-%m-%d)-$RUN_ID"
  # no [skip ci] here: GitHub would then also skip the release workflow
  # that runs when this PR is merged
  trailer=()
else
  branch=$BASE_BRANCH
  trailer=(-m "[skip ci]")
fi
git checkout -q -B "$branch" "origin/$BASE_BRANCH"
for pkg in "${todo[@]}"; do
  cp "$RESULTS/$pkg/PKGBUILD" "${PKGDIR[$pkg]}/PKGBUILD"
  git add "${PKGDIR[$pkg]}/PKGBUILD"
  git diff --cached --quiet && { skipped+=("$pkg: no diff"); continue; }
  ver=$(jq -r .pkgver "$RESULTS/$pkg/status.json")
  git commit -q -m "$pkg: auto-update to $ver." \
    -m "Built in a clean container and install-tested by $RUN_URL" "${trailer[@]}"
  committed+=("$pkg")
done
(( ${#committed[@]} )) || exit 0

# ------------------------------------------------------------------ pr mode
if [[ $MODE == pr ]]; then
  git push -q origin "HEAD:refs/heads/$branch"
  body=$(mktemp)
  {
    echo "<!-- auto-update-run-id: $RUN_ID -->"
    echo "Automated update of **${#committed[@]}** packages. Each one was bumped,"
    echo "built in a clean container and install-tested with \`pacman -U\` on a"
    echo "fresh system ([run]($RUN_URL), build logs in the \`auto-update-report\` artifact)."
    echo
    echo "**Merging this PR uploads the already-built packages to the repo.**"
    echo "To keep a package out, revert its commit before merging. If you edit a"
    echo "PKGBUILD here instead, that package is not uploaded but added to"
    echo "\`lists/to-release\` for a manual build."
    echo
    echo "| Package | From | To |"
    echo "|---|---|---|"
    for pkg in "${committed[@]}"; do
      jq -r --arg p "$pkg" '"| `\($p)` | \(.cur | gsub("[^A-Za-z0-9._+:~-]";"")) | \(.pkgver | gsub("[^A-Za-z0-9._+]";"")) |"' \
        "$RESULTS/$pkg/status.json"
    done
    if (( ${#skipped[@]} )); then
      echo
      echo "<details><summary>Not included (${#skipped[@]})</summary>"
      echo
      printf -- '- %s\n' "${skipped[@]}"
      echo "</details>"
    fi
  } > "$body"
  head -c 60000 "$body" > "$body.cut"
  gh label create auto-update --color 0075ca \
    --description "Automated PKGBUILD updates" 2>/dev/null || true
  pr_url=$(gh pr create --base "$BASE_BRANCH" --head "$branch" --label auto-update \
    --title "auto-update: ${#committed[@]} packages ($(date -u +%Y-%m-%d))" \
    --body-file "$body.cut")
  echo "opened $pr_url"
  exit 0
fi

# ------------------------------------------------------------------ push mode
pushed=false
for try in 1 2 3; do
  if git push -q origin "HEAD:$BASE_BRANCH"; then pushed=true; break; fi
  git fetch -q origin "$BASE_BRANCH"
  git rebase -q "origin/$BASE_BRANCH" || { git rebase --abort; break; }
done
if ! $pushed; then
  committed=()
  release_error="push to $BASE_BRANCH failed (conflict or permissions); nothing published"
  echo "$release_error"
  exit 1
fi
echo "pushed ${#committed[@]} commits"

if [[ ${RELEASE:-true} != true ]]; then
  release_packages "${committed[@]}"     # AUTO_RELEASE=false -> lists/to-release
  exit 0
fi
release_upload "${committed[@]}" || exit 1
