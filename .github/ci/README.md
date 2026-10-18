# Athena OS auto-update pipeline

`.github/workflows/auto-update.yml` + the scripts in this directory keep the
PKGBUILDs under `src/` up to date with almost no human work:

```
detect (1 job, ~15 min)          build (N shards, ≤20 parallel)        publish (1 job)            report (1 job)
──────────────────────           ───────────────────────────           ──────────────             ─────────────
pkgtree.sh    flat view of src/ ──► build-shard.sh                   ──►  publish.sh            ──►  report.py
meta-all.sh   read+lint all         per package, fresh container:        commit PKGBUILDs            report.md/.json artifact
detect.py scan  nvchecker.toml        bump → updpkgsums / pkgver()       push to main                job summary
nvchecker     upstream versions       verifysource → makepkg -s          sign + repo-add             one tracking issue
detect.py plan  shards                pacman -U install test             upload to R2, purge CDN     seen-cache for next run
```

## Package layout

PKGBUILDs live in nested directories under `src/` (`src/<category>/.../<name>/PKGBUILD`).
`pkgtree.sh` builds a flat `<name> -> src/.../<name>` view (symlinks) that all
the scripts work on, plus a map used to commit to the real path. **Directory
names must be unique** across the tree; the run fails with a clear error if two
packages share a name.

## What it does

* **Detection without committed state.** "Old" versions are read from the
  PKGBUILDs every run (no `oldver.json` to commit, nothing lost when a run
  fails). Release packages are compared with pacman's `vercmp` rules (ported
  to Python), so downgrades and odd tags are never applied. VCS packages
  (`pkgver()` + git source, ~1800) are checked with `git ls-remote` against the
  commit hash already in `pkgver` - no cloning unless something changed.
* **Supported upstreams** (generated automatically from the source URLs):
  GitHub tags, GitLab tags, PyPI, RubyGems, CPAN, SourceForge (RSS), git
  commits. On the current tree this tracks ~3150 of 4613 packages. Anything
  else can be added by hand in `nvchecker-overrides.toml`; the report lists
  the most common untracked hosts so you know where an override pays off.
* **Clean builds.** Every package builds in its own throw-away
  `athenaos/base-devel` container (same base as the repo's `Dockerfile`), so
  missing `makedepends` are caught. The packages are
  then installed with `pacman -U` in a **second, fresh** container, which
  catches missing runtime depends (including ones only listed in
  makedepends) and file conflicts.
* **Build output is not trusted.** Upstream code runs in the build
  container, so the runner checks everything it returns before it can be
  published: the PKGBUILD may only differ in `pkgver`, `pkgrel` and (for
  release updates) the checksums; every package's `.PKGINFO` must name a
  package of *this* PKGBUILD with exactly the expected version and arch.
  Anything else is rejected as a build failure. The allowed lines are
  validated, not skipped: a `pkgver=` line must be exactly `pkgver=<version>`,
  checksum arrays may only hold quoted digests (with `SKIP` exactly where it
  was before). Symlinks, FIFOs and oversized files in the output are
  discarded, and the verified results are written to a directory the
  container never had access to. Build jobs hold no secrets.
* **Manual bumps and new packages are shipped.** Every run downloads
  `athena.db` from the R2 URL and compares each PKGBUILD's `epoch:pkgver-pkgrel` with the
  repo. A tree version the repo does not have (you fixed a PKGBUILD by hand
  and pushed 1.0.3 while the repo still serves 1.0.2, a pkgrel bump, a new
  package) is built **exactly as it is on main** (any change to the PKGBUILD
  by the build is rejected), install-tested and released right away, in both
  publish modes: it changes no PKGBUILD, the review already happened when it
  was merged. Shown as `ship` in the Build jobs table and as
  `1.0.2-1 (repo) → 1.0.3-1 (tree, shipped as-is)` in the report. VCS packages
  are not compared (their pkgver is only known after a fetch); a repo version
  *newer* than the tree is reported as a warning. If the database cannot be
  downloaded, nothing is shipped that run. Override the URL with the
  `REPO_DB_URL` variable.
* **Failures are not retried every day.** A package that failed for upstream
  version X is skipped (but still listed in the report as "previous run")
  until upstream moves past X, 7 days pass, or you run with `retry_failed`.
* **Publishing** does what the former `build-and-publish.yml` did, with the
  packages the run already built and verified: sign them, download the repo
  database from R2, `repo-add --sign`, upload packages + database (including
  the unversioned `.db`/`.files` names), delete superseded versions, purge the
  Cloudflare cache. Afterwards the served database is downloaded again and its
  signature and the new entries are verified. Commits are
  `"<pkg>: auto-update to <ver>."` with `[skip ci]`. If the upload fails after
  the push, the packages are appended to `lists/to-release` for a manual
  release.

## Publish modes (`PUBLISH_MODE`)

| | `push` (default) | `pr` |
|---|---|---|
| Where commits go | straight to `main` | branch `auto-update/<date>-<run>`, **one PR per run** |
| When packages are uploaded | right after the push | when the PR is merged (`auto-update-release.yml`) |
| Rebuild on merge? | – | no: the packages built by the run are uploaded |
| Reviewer drops/edits a package | – | it is not uploaded; it goes to `lists/to-release` |
| Packages already in an open PR | – | skipped by later runs until the PR is merged/closed (if GitHub can't be asked, a publishing run stops instead of risking a duplicate PR) |

The release workflow uses `pull_request_target`: it runs from main's copy
of the workflow with ref `main`, so an environment restricted to main
works, and it only checks out main after the merge.

In `pr` mode build artifacts are kept 14 days; merge within that window or
the packages land in `lists/to-release` for a manual build. Squash, rebase
and merge commits all work (the release step compares file contents). Set the
mode with the repository variable `PUBLISH_MODE`, or per run with the
`publish_mode` input. If PRs are opened with the default token, enable
*Settings → Actions → Allow GitHub Actions to create and approve pull
requests*, or set `BA_BOT_TOKEN`.

In both modes, `ship` packages (tree ahead of the repo, see above) are
released directly by the run and never go through a PR: there is no PKGBUILD
change to review.

## Builder image

The `image` job builds `.github/ci/Dockerfile` once per run and passes it to
the build shards as the `builder-image` artifact (kept for one day). This
avoids one Docker Hub pull per shard (anonymous pulls are rate-limited) and
gives every shard the same package versions. Nothing is stored under the
repository's Packages. If the artifact is missing, each shard builds the
image itself and the run continues with a warning.

## Whole-repo build status (rolling audit)

Besides updated packages, each run builds `audit` (default 300, variable
`AUDIT_PER_RUN`) other packages exactly as they are on main: never-tested
packages first, then PKGBUILDs changed since their last test, then the
oldest results. That is a full pass over all ~4600 packages roughly every two
weeks. Audit builds are never published.

The last result for every package is kept in a status database (Actions
cache, also copied into each report as `status-db.json`) together with a
fingerprint of the PKGBUILD it was built from. So the report lists **all**
currently failing packages, not just the ones touched today; a failure
disappears as soon as the package builds again, and a package whose
PKGBUILD was changed by a human is re-tested first. The summary shows for
how many packages the status is known (it starts at 0 and fills up during
the first cycle).

## Reverse dependencies and removal help

`detect.py` builds a dependency graph of the tree (`depgraph.json` in the
report artifact) from `depends`, `makedepends`, `checkdepends` and
`optdepends` (including `*_x86_64` arrays and `provides`). Split packages
are resolved per output: `depends=()` inside `package_python2-foo()`
replaces the top-level one, like makepkg does. For every package that fails
to build or has broken sources the report shows who needs which output and
a verdict:

* ✅ nothing in Athena needs it / only optional (optdepends)
* ⚠️ only needed by other failing packages (remove them together)
* ❌ needed by N working packages

Two extra sections use the same graph: **Removal candidates** (failing and
not needed by any working package) and **Python 2 packages that nothing
hard-depends on**, which lists every `python2-*` output, including the
`python2-` half of a `python-`/`python2-` pkgbase, with the suggested action
("drop `package_python2-foo()` from `python-foo`" or "remove package").
Only the Athena tree is considered; something an end user installs
directly, or an AUR package that depends on it, is invisible here.

## Duplicates of Arch Linux packages

Each run lists Arch's official `core`, `extra` and `multilib` packages (not
the AUR) and the report's **Also in Arch official repositories** section shows
packages built here that Arch also ships, with both versions and how many
Athena packages depend on them, so the Athena copy can be dropped in favour
of Arch's package.

Nothing is removed automatically: a copy may be kept on purpose (newer,
patched, or an unrelated program with the same name).

## Report

Artifact `auto-update-report` (and the issue labelled `auto-update-report`):

| Section | Sources |
|---|---|
| ❌ fail to build | makepkg errors, dependency install failures, install test, timeouts |
| 🔗 invalid / broken sources | `updpkgsums`/`--verifysource` failures, dead git repos (ls-remote), weekly URL probe (404/410/DNS/refused/bad TLS) |
| 🧩 invalid / unexpected PKGBUILD | `pkgcheck`, `bash -n`, sourcing errors, `makepkg --printsrcinfo` lint, name ≠ dir, invalid pkgver/pkgrel, checksum count ≠ source count, missing `package()`, sources that don't use `$pkgver`, pkgver computed after the `pkgver=` line, upstream versions that aren't valid pkgvers |

Plus 🗑️ removal candidates and 🐍 unused Python 2 packages (see above).
`report.json` has the same data machine-readable, `depgraph.json` the full
reverse-dependency graph, `status-db.json` the last build result of every
package, and `logs/<pkg>/build.log` the (truncated) log of every build.

A dry run of the static checks on today's tree already finds real bugs, e.g.
`python-textract`, `python-pylzma`, `python-wayback` (syntax error in
`sha512sums`), `sploitego`, `vidalia` (2 checksums, 1 source),
`perl-crypt-curve25519` (pkgname is `perl-net-tftp`).

## Setup

1. Copy `.github/ci/` and the two workflows (`auto-update.yml`,
   `auto-update-release.yml`) into the repo. The old `update-check.yml` and
   `build-and-publish.yml` are replaced by them (disable or delete both:
   `build-and-publish.yml` would otherwise rebuild and re-upload every merged
   package a second time).
2. **Signing key.** Use the repo's existing signing key, or better a dedicated
   CI key signed by it; users must have it in `athena-keyring` or the packages
   are rejected.
3. Create the environment **`athena-repo`** (Settings → Environments), restrict
   it to the `main` branch, add required reviewers if you want a human click
   before each upload, and put the secrets there, not at repository level:
   * `GPG_KEY_ID` (full fingerprint), `GPG_PRIVATE_KEY` (armored),
     `GPG_PASSPHRASE` (if any)
   * `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`
   * `CF_ZONE_ID`, `CF_API_TOKEN` (cache purge; optional)
   * `BOT_TOKEN` (optional: a token allowed to push to a protected `main`)
   * environment variables (optional): `REPO_NAME` (default `athena`),
     `REPO_ARCH` (default `x86_64`), `REPO_PATH` (key prefix in the bucket,
     default `REPO_NAME/os/REPO_ARCH`, i.e. `athena/os/x86_64`) and
     `REPO_BASE_URL` (public URL of that prefix, default
     `https://hub.athenaos.org/REPO_PATH`; used for the post-upload check and
     the Cloudflare purge)
4. Repository variables: `AUTO_PUBLISH=true` turns publishing on for the
   daily run (default **off**: builds and reports only). `PUBLISH_MODE=pr`
   opens a PR instead of pushing (see above). `AUTO_RELEASE=false` commits
   PKGBUILDs but puts the packages in `lists/to-release` instead of
   uploading. `REPORT_ISSUE=false` disables the tracking issue.
   `PROBE_SOURCES=off|on|sundays` controls the source-URL probe of the daily run.
   `AUDIT_PER_RUN` sets how many unchanged packages are build-tested per run.
5. Settings → Actions → General: allow GitHub Actions to create pull requests
   (needed for `pr` mode).

The secrets `GH_PAT` and friends from the old workflows are no longer needed:
the pipeline uses the run's own token and never gives upstream build code any
secret.

### Suggested rollout

1. Merge with `AUTO_PUBLISH` unset → a few days of build-and-report only.
2. `AUTO_PUBLISH=true`, `PUBLISH_MODE=pr` → one PR a day; merging it releases.
3. `PUBLISH_MODE=push` → fully automatic.

Cancelling a run stops it: build shards that haven't started don't start,
and nothing is committed or released. The report still runs.

## Removing packages

**Actions → Remove packages → Run workflow**, with one or more package
directory names. The run deletes their sources on a branch
`remove/<date>-<run>` and opens one PR, whose description lists every package
name that will disappear from the repository (all outputs of a split
PKGBUILD) and warns if other packages in the tree still depend on them.
Nothing happens to the repository until the PR is **merged**; closing it
without merging does nothing. On merge, the release workflow removes the
entries from the repository database, deletes the package files from R2, purges the cache, verifies the served
database and comments on the PR.

## Manual runs (Actions → Auto-update packages → Run workflow)

The run summary opens with a **Run settings** table: what was
chosen for each input and the value actually used (after the repository
variables filled in `default`/`auto`).

* `packages: "foo bar"` - **added** to the normal run and built first:
  updated if upstream is newer, else rebuilt with `pkgrel+1` (handy after a
  library soname bump). Tick `only_these` to build **only** these packages
  (same as `max_updates: 0` + `audit: 0`).
* A package named in `packages` whose tree version is ahead of the repo is
  shipped as-is (no `pkgrel+1`).
* `publish: false` - test without touching main or the repo.
* `publish_mode: pr|push` - override `PUBLISH_MODE` for this run.
* `probe_sources: on|off|sundays` - run the URL probe now, skip it, or only
  on Sundays. `default` follows the `PROBE_SOURCES` variable (`sundays` if unset).
* `retry_failed: true` - ignore the failure cache.
* **Build test only** (no updates): `max_updates: 0`, `audit: 300` (or
  `4613` for the whole repo in one run: up to 200 shards, 20 at a time,
  roughly half a day), `publish: false`. Packages named in `packages` are
  always built, even with `max_updates: 0`.

## Tuning files

* `exclude.txt` - never auto-update; `lists/to-remove` is honoured too if it
  exists. Package names matching `^python2-|-py2$` are skipped (change with
  `--exclude-regex` in the workflow if Athena ever needs that).
* `nvchecker-overrides.toml` - hand-written nvchecker entries win over the
  generated ones.

## Limits / ideas for later

* Only x86_64 is built and uploaded, as before.
* Packages are built against the repo as it is; if a library and a tool that
  needs the new library update in the same run, the tool may fail once and
  succeed next run.
* Builds needing >14 GB disk or >60 min (`PER_PKG_TIMEOUT_MIN`) are reported
  as failures; exclude them or give them a larger self-hosted runner.
