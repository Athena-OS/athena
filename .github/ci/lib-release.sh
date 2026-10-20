#!/usr/bin/env bash
# lib-release.sh (Athena OS) - sourced by publish.sh and release-merged.sh.
#
# Releases verified packages to the Athena repo on Cloudflare R2, the same way
# the former build-and-publish.yml did: sign each package, download the repo
# database, repo-add --sign, upload packages + database, delete superseded
# versions, purge the Cloudflare cache.
#
# release_setup              import the signing key, check it can sign, check
#                            R2 credentials. Run BEFORE anything reaches the
#                            base branch (push mode), so broken secrets never
#                            leave committed-but-unreleased packages behind.
# release_upload <pkg>...    sign + repo-add + upload + verify + purge. Any
#                            failure queues the packages in lists/to-release.
# release_packages <pkg>...  setup + upload (used by release-merged.sh)
# queue_for_humans <msg> <pkg>...  append to lists/to-release on the base branch
#
# All functions set $released / $release_error and return non-zero on
# failure. They never rely on `set -e` (callers use them in `||` lists).
#
# Env: PKGS GPG_KEY_ID GPG_PRIVATE_KEY [GPG_PASSPHRASE]
#      AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY R2_ENDPOINT R2_BUCKET
#      [REPO_NAME=athena] [REPO_ARCH=x86_64]
#      [REPO_PATH=$REPO_NAME/os/$REPO_ARCH]  key prefix in the bucket
#      [REPO_BASE_URL=https://hub.athenaos.org/$REPO_PATH]  public URL of that prefix
#      [CF_ZONE_ID CF_API_TOKEN]   (cache purge, skipped if unset)
#      [RELEASE=true|false] [BASE_BRANCH=main]
# shellcheck disable=SC2034  # released/release_error are read by the callers
_locked=false

REPO_NAME=${REPO_NAME:-athena}
REPO_ARCH=${REPO_ARCH:-x86_64}
REPO_PATH=${REPO_PATH:-$REPO_NAME/os/$REPO_ARCH}; REPO_PATH=${REPO_PATH#/}; REPO_PATH=${REPO_PATH%/}
REPO_BASE_URL=${REPO_BASE_URL:-https://hub.athenaos.org/$REPO_PATH}
BASE_BRANCH=${BASE_BRANCH:-main}

_fail() { release_error=$1; echo "release: $1" >&2; return 1; }
_s3() { aws s3 "$@" --endpoint-url "$R2_ENDPOINT"; }
_remote() { echo "s3://$R2_BUCKET/$REPO_PATH"; }

# Repo lock in the bucket: PutObject with If-None-Match:* is atomic on R2, so
# two release jobs (per-PR concurrency, or a manual run) never update the
# database at the same time. A lock older than LOCK_STALE_MIN (180) is taken
# over: a killed job cannot clean up.
_lock_key() { echo "$REPO_PATH/.release.lock"; }
_lock() {
  local deadline=$(( $(date +%s) + ${LOCK_WAIT_MIN:-60} * 60 )) body age mod
  body=$(mktemp); printf '%s\n' "$(date -u +%FT%TZ) ${GITHUB_RUN_ID:-local} ${GITHUB_REPOSITORY:-}" > "$body"
  while :; do
    if aws s3api put-object --bucket "$R2_BUCKET" --key "$(_lock_key)" --body "$body" \
         --if-none-match '*' --endpoint-url "$R2_ENDPOINT" >/dev/null 2>&1; then
      rm -f "$body"; _locked=true; return 0
    fi
    mod=$(aws s3api head-object --bucket "$R2_BUCKET" --key "$(_lock_key)" --endpoint-url "$R2_ENDPOINT" \
            --query LastModified --output text 2>/dev/null) || { sleep 5; continue; }   # vanished: retry at once
    age=$(( $(date +%s) - $(date -d "$mod" +%s 2>/dev/null || echo 0) ))
    if (( age > ${LOCK_STALE_MIN:-180} * 60 )); then
      echo "::warning::repo lock is $(( age / 60 )) min old ($(aws s3 cp "s3://$R2_BUCKET/$(_lock_key)" - --endpoint-url "$R2_ENDPOINT" 2>/dev/null | head -c 200)); taking it over"
      aws s3api delete-object --bucket "$R2_BUCKET" --key "$(_lock_key)" --endpoint-url "$R2_ENDPOINT" >/dev/null 2>&1 || true
      continue
    fi
    (( $(date +%s) < deadline )) || { rm -f "$body"; _fail "repo lock still held after ${LOCK_WAIT_MIN:-60} min"; return 1; }
    echo "repo is locked by another release; waiting..."
    sleep 30
  done
}
_unlock() {
  [[ ${_locked:-false} == true ]] || return 0
  aws s3api delete-object --bucket "$R2_BUCKET" --key "$(_lock_key)" --endpoint-url "$R2_ENDPOINT" >/dev/null 2>&1 || true
  _locked=false
}

# pkgs-<shard> artifacts are tars (package names may contain ':'); unpack them
# into $PKGS/<pkg>/. They were written by the runner after verification.
unpack_pkgs() {
  local t
  shopt -s nullglob
  for t in "$PKGS"/*.tar; do
    tar -xf "$t" -C "$PKGS" --no-same-owner --no-same-permissions || return 1
    rm -f "$t"
  done
  shopt -u nullglob
}

release_setup() {
  local v
  GPG_KEY_ID=${GPG_KEY_ID:-}; GPG_KEY_ID=${GPG_KEY_ID#0x}; GPG_KEY_ID=${GPG_KEY_ID//[[:space:]]/}; GPG_KEY_ID=${GPG_KEY_ID^^}
  for v in GPG_KEY_ID GPG_PRIVATE_KEY AWS_ACCESS_KEY_ID AWS_SECRET_ACCESS_KEY R2_ENDPOINT R2_BUCKET; do
    [[ -n ${!v:-} ]] || { _fail "secret/variable $v is not set"; return 1; }
  done
  command -v aws >/dev/null || { _fail "aws-cli is not installed"; return 1; }

  export GNUPGHOME
  GNUPGHOME=$(mktemp -d) && chmod 700 "$GNUPGHOME" || { _fail "cannot create GNUPGHOME"; return 1; }
  printf '%s\n' 'allow-loopback-pinentry' 'allow-preset-passphrase' > "$GNUPGHOME/gpg-agent.conf"
  printf '%s\n' 'pinentry-mode loopback' > "$GNUPGHOME/gpg.conf"
  gpg --batch --quiet --import <<<"$GPG_PRIVATE_KEY" || { _fail "cannot import the signing key"; return 1; }
  if [[ -n ${GPG_PASSPHRASE:-} ]]; then
    gpgconf --launch gpg-agent || { _fail "cannot start gpg-agent"; return 1; }
    local grip
    for grip in $(gpg --with-keygrip -K "$GPG_KEY_ID" | awk '/Keygrip/ {print $3}'); do
      /usr/lib/gnupg/gpg-preset-passphrase --preset -P "$GPG_PASSPHRASE" "$grip" ||
        { _fail "cannot preset the key passphrase"; return 1; }
    done
  fi
  local t
  t=$(mktemp -d); echo probe > "$t/f"
  gpg --batch --yes --no-tty --default-key "$GPG_KEY_ID" -b "$t/f" 2>/dev/null &&
    gpg --batch --verify "$t/f.sig" "$t/f" 2>/dev/null ||
    { _fail "the signing key cannot sign (wrong key id or passphrase?)"; rm -rf "$t"; return 1; }
  rm -rf "$t"

  # head-bucket, not `s3 ls <prefix>`: ls exits 1 on an empty prefix (new repo path)
  aws s3api head-bucket --bucket "$R2_BUCKET" --endpoint-url "$R2_ENDPOINT" >/dev/null 2>&1 ||
    { _fail "cannot access the R2 bucket (credentials, endpoint or bucket?)"; return 1; }
  return 0
}

# pkgname-ver-rel-arch.pkg.tar.zst -> pkgname
_pkgname_of() { local b=${1##*/}; b=${b%.pkg.tar.zst}; b=${b%-*}; b=${b%-*}; echo "${b%-*}"; }

release_upload() {
  (( $# )) || return 0
  _lock || { _queue_after_failure "$@"; return 1; }
  _release_upload_locked "$@"; local rc=$?
  _unlock
  return $rc
}
_release_upload_locked() {
  local work pkg f rc=0
  work=$(mktemp -d)
  for pkg in "$@"; do cp "$PKGS/$pkg"/*.pkg.tar.zst "$work/" || { _fail "missing packages for $pkg"; rc=1; }; done
  (( rc == 0 )) || { rm -rf "$work"; _queue_after_failure "$@"; return 1; }

  local remote; remote=$(_remote)
  (
    set -e
    cd "$work"
    # current database (absent on an empty repo)
    _s3 cp "$remote/$REPO_NAME.db.tar.gz" "./$REPO_NAME.db.tar.gz" 2>/dev/null || true
    _s3 cp "$remote/$REPO_NAME.files.tar.gz" "./$REPO_NAME.files.tar.gz" 2>/dev/null || true
    [[ -f $REPO_NAME.db.tar.gz ]] && ln -sf "$REPO_NAME.db.tar.gz" "$REPO_NAME.db"
    [[ -f $REPO_NAME.files.tar.gz ]] && ln -sf "$REPO_NAME.files.tar.gz" "$REPO_NAME.files"

    for f in ./*.pkg.tar.zst; do
      gpg --batch --yes --no-tty --default-key "$GPG_KEY_ID" --detach-sign "$f"
    done
    repo-add --sign --key "$GPG_KEY_ID" -n "$REPO_NAME.db.tar.gz" ./*.pkg.tar.zst

    # packages first, so the database never points at a missing file
    for f in ./*.pkg.tar.zst ./*.pkg.tar.zst.sig; do _s3 cp "$f" "$remote/${f#./}"; done
    for ext in db.tar.gz db.tar.gz.sig files.tar.gz files.tar.gz.sig; do
      _s3 cp "./$REPO_NAME.$ext" "$remote/$REPO_NAME.$ext"
    done
    # unversioned names pacman fetches, with signatures of the same content
    _s3 cp "./$REPO_NAME.db.tar.gz"        "$remote/$REPO_NAME.db"
    _s3 cp "./$REPO_NAME.db.tar.gz.sig"    "$remote/$REPO_NAME.db.sig"
    _s3 cp "./$REPO_NAME.files.tar.gz"     "$remote/$REPO_NAME.files"
    _s3 cp "./$REPO_NAME.files.tar.gz.sig" "$remote/$REPO_NAME.files.sig"
  ) || { rm -rf "$work"; _fail "signing or upload failed"; _queue_after_failure "$@"; return 1; }

  # verify: the served database must carry our signature and the new entries
  local chk; chk=$(mktemp -d)
  if ! _s3 cp "$remote/$REPO_NAME.db" "$chk/db" >/dev/null 2>&1 ||
     ! _s3 cp "$remote/$REPO_NAME.db.sig" "$chk/db.sig" >/dev/null 2>&1 ||
     ! gpg --batch --verify "$chk/db.sig" "$chk/db" 2>/dev/null; then
    rm -rf "$chk" "$work"
    _fail "UPLOADED, BUT THE SERVED DATABASE SIGNATURE DOES NOT VERIFY - check the repo now"
    _queue_after_failure "$@"; return 1
  fi
  tar -tzf "$chk/db" | sed 's|^\./||' > "$chk/list"
  local missing=() entry
  for f in "$work"/*.pkg.tar.zst; do
    entry=${f##*/}; entry=${entry%-*.pkg.tar.zst}
    grep -qxF "$entry/" "$chk/list" || missing+=("$entry")
  done
  rm -rf "$chk"
  if (( ${#missing[@]} )); then
    rm -rf "$work"; _fail "not in the repo database after upload: ${missing[*]}"
    _queue_after_failure "$@"; return 1
  fi
  # the package objects themselves: present with the exact local size
  local bad=() size
  for f in "$work"/*.pkg.tar.zst "$work"/*.pkg.tar.zst.sig; do
    size=$(aws s3api head-object --bucket "$R2_BUCKET" --key "$REPO_PATH/${f##*/}" \
             --endpoint-url "$R2_ENDPOINT" --query ContentLength --output text 2>/dev/null) || size=missing
    [[ $size == "$(stat -c %s "$f")" ]] || bad+=("${f##*/} ($size)")
  done
  if (( ${#bad[@]} )); then
    rm -rf "$work"; _fail "UPLOADED FILES ARE MISSING OR TRUNCATED: ${bad[*]} - the db points at them, check the repo now"
    _queue_after_failure "$@"; return 1
  fi

  # superseded versions of the same package names: delete after the upload
  local listing new old name
  listing=$(_s3 ls "$remote/" | awk '{print $4}' | grep '\.pkg\.tar\.zst$' || true)
  for f in "$work"/*.pkg.tar.zst; do
    new=${f##*/}; name=$(_pkgname_of "$new")
    while read -r old; do
      [[ -n $old && $old != "$new" && $(_pkgname_of "$old") == "$name" ]] || continue
      echo "removing superseded $old"
      _s3 rm "$remote/$old" >/dev/null || true
      _s3 rm "$remote/$old.sig" >/dev/null 2>&1 || true
    done <<<"$listing"
  done

  # Cloudflare cache purge (30 URLs per call)
  if [[ -n ${CF_ZONE_ID:-} && -n ${CF_API_TOKEN:-} ]]; then
    local urls=() n
    for f in "$work"/*.pkg.tar.zst "$work"/*.pkg.tar.zst.sig; do urls+=("$REPO_BASE_URL/${f##*/}"); done
    for n in db db.sig db.tar.gz db.tar.gz.sig files files.sig files.tar.gz files.tar.gz.sig; do
      urls+=("$REPO_BASE_URL/$REPO_NAME.$n")
    done
    local i
    for ((i = 0; i < ${#urls[@]}; i += 30)); do
      printf '%s\n' "${urls[@]:i:30}" | jq -R . | jq -sc '{files: .}' |
        curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
          -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" --data @- |
        jq -e '.success' >/dev/null || echo "::warning::Cloudflare cache purge failed (packages are uploaded)"
    done
  fi
  rm -rf "$work"
  released=true
  return 0
}

# remove_packages <pkgname>...  repo-remove the names from the database, delete
# their files from R2, purge the cache, verify. Names are package names (not
# directories): split packages list every output.
remove_packages() {
  (( $# )) || return 0
  _lock || return 1
  _remove_packages_locked "$@"; local rc=$?
  _unlock
  return $rc
}
_remove_packages_locked() {
  local work remote n f rc=0
  work=$(mktemp -d); remote=$(_remote)
  (
    set -e
    cd "$work"
    _s3 cp "$remote/$REPO_NAME.db.tar.gz" "./$REPO_NAME.db.tar.gz"
    _s3 cp "$remote/$REPO_NAME.files.tar.gz" "./$REPO_NAME.files.tar.gz"
    ln -sf "$REPO_NAME.db.tar.gz" "$REPO_NAME.db"; ln -sf "$REPO_NAME.files.tar.gz" "$REPO_NAME.files"
    # repo-remove exits non-zero for a name that is not in the db: not an error here
    for n in "$@"; do repo-remove --sign --key "$GPG_KEY_ID" "$REPO_NAME.db.tar.gz" "$n" || true; done
    for ext in db.tar.gz db.tar.gz.sig files.tar.gz files.tar.gz.sig; do
      _s3 cp "./$REPO_NAME.$ext" "$remote/$REPO_NAME.$ext"
    done
    _s3 cp "./$REPO_NAME.db.tar.gz"        "$remote/$REPO_NAME.db"
    _s3 cp "./$REPO_NAME.db.tar.gz.sig"    "$remote/$REPO_NAME.db.sig"
    _s3 cp "./$REPO_NAME.files.tar.gz"     "$remote/$REPO_NAME.files"
    _s3 cp "./$REPO_NAME.files.tar.gz.sig" "$remote/$REPO_NAME.files.sig"
  ) || { rm -rf "$work"; _fail "repo-remove or database upload failed"; return 1; }

  # the files, after the database no longer points at them
  local listing old deleted=()
  listing=$(_s3 ls "$remote/" | awk '{print $4}' | grep '\.pkg\.tar\.zst$' || true)
  for n in "$@"; do
    while read -r old; do
      [[ -n $old && $(_pkgname_of "$old") == "$n" ]] || continue
      _s3 rm "$remote/$old" >/dev/null && deleted+=("$old") || rc=1
      _s3 rm "$remote/$old.sig" >/dev/null 2>&1 || true
    done <<<"$listing"
  done
  echo "deleted files: ${deleted[*]:-none}"

  local chk; chk=$(mktemp -d)
  if ! _s3 cp "$remote/$REPO_NAME.db" "$chk/db" >/dev/null 2>&1 ||
     ! _s3 cp "$remote/$REPO_NAME.db.sig" "$chk/db.sig" >/dev/null 2>&1 ||
     ! gpg --batch --verify "$chk/db.sig" "$chk/db" 2>/dev/null; then
    rm -rf "$chk" "$work"; _fail "UPLOADED, BUT THE SERVED DATABASE SIGNATURE DOES NOT VERIFY - check the repo now"; return 1
  fi
  local still=()
  tar -tzf "$chk/db" > "$chk/list" || { rm -rf "$chk"; _fail "cannot read the served database to verify the removal"; return 1; }
  sed -nE 's|^(\./)?([^/]+)/$|\2|p' "$chk/list" | sed -E 's/-[^-]+-[^-]+$//' | sort -u > "$chk/names"
  for n in "$@"; do grep -qxF -- "$n" "$chk/names" && still+=("$n"); done
  rm -rf "$chk" "$work"
  (( ${#still[@]} == 0 )) || { _fail "still in the repo database after removal: ${still[*]}"; return 1; }

  if [[ -n ${CF_ZONE_ID:-} && -n ${CF_API_TOKEN:-} ]]; then
    local urls=() x
    for x in "${deleted[@]}"; do urls+=("$REPO_BASE_URL/$x" "$REPO_BASE_URL/$x.sig"); done
    for x in db db.sig db.tar.gz db.tar.gz.sig files files.sig files.tar.gz files.tar.gz.sig; do urls+=("$REPO_BASE_URL/$REPO_NAME.$x"); done
    local i
    for ((i = 0; i < ${#urls[@]}; i += 30)); do
      printf '%s\n' "${urls[@]:i:30}" | jq -R . | jq -sc '{files: .}' |
        curl -sS -X POST "https://api.cloudflare.com/client/v4/zones/$CF_ZONE_ID/purge_cache" \
          -H "Authorization: Bearer $CF_API_TOKEN" -H "Content-Type: application/json" --data @- |
        jq -e '.success' >/dev/null || echo "::warning::Cloudflare cache purge failed"
    done
  fi
  (( rc == 0 )) || { _fail "some package files could not be deleted from R2"; return 1; }
  released=true
}

_queue_after_failure() {
  release_error+="; packages added to lists/to-release"
  queue_for_humans "auto-update packages awaiting release" "$@" ||
    release_error+=" (and pushing lists/to-release failed!)"
}

release_packages() {
  (( $# )) || return 0
  if [[ ${RELEASE:-true} != true ]]; then
    release_error="AUTO_RELEASE=false: packages added to lists/to-release for a manual release"
    queue_for_humans "auto-update packages awaiting manual release" "$@"
    return
  fi
  if ! release_setup; then
    _queue_after_failure "$@"
    return 1
  fi
  release_upload "$@"
}

queue_for_humans() {
  local msg=$1 try; shift
  (( $# )) || return 0
  for try in 1 2 3; do
    git fetch -q origin "$BASE_BRANCH" && git checkout -q -B "$BASE_BRANCH" "origin/$BASE_BRANCH" || return 1
    mkdir -p lists
    printf '%s\n' "$@" >> lists/to-release
    sort -u -o lists/to-release lists/to-release
    git add lists/to-release
    git diff --cached --quiet && return 0
    git commit -q -m "lists/to-release: $msg" -m "[skip ci]" || return 1
    git push -q origin "HEAD:$BASE_BRANCH" && return 0
    sleep $(( try * 5 ))
  done
  return 1
}
