<h1 align="center">
  Dive into a new Pentesting Experience with<br>
Athena OS
</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Maintained%3F-Yes-CD8335">
  <img src="https://badgen.net/github/release/Athena-OS/athena">
  <img src="https://badgen.net/github/stars/Athena-OS/athena">
  <img src="https://img.shields.io/github/issues-raw/Athena-OS/athena">
  <img src="https://img.shields.io/github/issues-closed-raw/Athena-OS/athena">
  <img src="https://img.shields.io/github/license/Athena-OS/athena">
</p>

<p align="center">
  <a href="https://www.instagram.com/athenaos_sec">
    <img src="https://img.shields.io/badge/Follow%20us%20on%20Instagram-Ya?logo=instagram&logoColor=white&color=%23e95950&style=['for-the-badge']&url=https://www.instagram.com/athenaos_sec">
    </a>
  <a href="https://discord.gg/AHXqyJHhGc">
    <img src="https://img.shields.io/badge/Join%20on%20Discord-Ya?logo=discord&logoColor=white&color=%235865F2&style=['for-the-badge']&url=https://discord.gg/AHXqyJHhGc">
  </a>
</p>

<!--<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/174499581-e0f74d41-36ce-4c01-af0d-6ecd98841a64.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/174499581-e0f74d41-36ce-4c01-af0d-6ecd98841a64.png" width="600" height="496" />
</p>-->
![image](https://github.com/Athena-OS/athena/assets/83867734/b130dd25-5e7f-4cc8-bc16-6f384b4210f3)

<!--
<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/192104268-ddfd4b2e-d79e-44e9-a0f7-3d627829d894.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/192104268-ddfd4b2e-d79e-44e9-a0f7-3d627829d894.png" width="400" height="422" />
</p>
-->
<!--
<p align="center">
  <img src="https://user-images.githubusercontent.com/83867734/192106351-96cc40a5-994c-4068-9092-f05c69e686c6.png" data-canonical-src="https://user-images.githubusercontent.com/83867734/192106351-96cc40a5-994c-4068-9092-f05c69e686c6.png" width="400" height="400" />
</p>
-->

<h3 align="center">
  🏅Born for InfoSec Professionals, Bug Bounty Hunters, Passionate Students and Spicy Hackers🏅
</h3>

<h3 align="center">
  💞
  <a href="https://athenaos.org/">
  Get Athena OS Now!
    </a>
  💞
</h3>
<br>
<p align="center">
  <a href="https://hub.docker.com/u/athenaos"><img src="https://user-images.githubusercontent.com/83867734/224526828-b4f2a470-d539-494d-9ac0-34568a75af3a.png" width="150" height="128" /></a>
</p>
<h5 align="center">
Click Docker icon above to explore Athena OS Docker containers!
</h5>
<br>
<p align="center">
  <a href="https://apps.microsoft.com/store/detail/athena-os/9N1M7Q4F1KQF?hl=en-us&gl=us"><img src="https://upload.wikimedia.org/wikipedia/commons/f/f7/Get_it_from_Microsoft_Badge.svg" width="250" height="90" /></a>
</p>
<h5 align="center">
Click the icon above to explore Athena OS WSL in Microsoft Store App!
</h5>
<br>

## Automated Package Updates
 
Packages in this repository are kept up to date automatically via a daily GitHub Actions workflow powered by [nvchecker](https://github.com/lilydjwg/nvchecker).
 
### How it works
 
The automation runs every day (and can also be triggered manually) and goes through the following steps:
 
1. **Config generation** — `.nvchecker/generate-nvchecker-config.py` scans every `PKGBUILD` under `src/` and auto-generates `.nvchecker/nvchecker.toml`. Each package is classified as one of:
   - **Release package** — has a static `pkgver=` and a remote source URL. Tracked by latest tag/release on the hosting platform.
   - **VCS package** — has a `pkgver()` function and a `git+https://` source. Tracked by latest upstream commit.
   - **Local-only package** — all sources are local files. Skipped silently (no upstream to track).
 
2. **Version check** — `nvchecker` queries the upstream of every tracked package and writes the results to `.nvchecker/newver.json`. This is compared against `.nvchecker/oldver.json` (committed in the repo) to find packages that have a new version available.
 
3. **PKGBUILD update & PR** — for each outdated package the workflow:
   - Creates a dedicated branch `auto-update/<pkgname>-<newver>`.
   - Updates `pkgver` and resets `pkgrel` to `1` in the `PKGBUILD`.
   - For **release packages**: regenerates checksums with `updpkgsums`.
   - For **VCS packages**: clones the upstream repo, runs the `pkgver()` function locally to compute the real Arch-style version string (e.g. `131.940a5d3`), and keeps `sha512sums=('SKIP')` as is.
   - Opens a pull request labelled `auto-update` for human review before anything lands on `main`.
 
4. **State save** — `.nvchecker/oldver.json` is updated with the versions seen in this run and committed back to `main`, so the next run only opens PRs for genuinely new changes.
 
### Supported hosting platforms
 
| Platform | Detection |
|---|---|
| GitHub | `github.com/<user>/<repo>` |
| GitLab (gitlab.com + self-hosted) | `gitlab.*/<user>/<repo>` |
| Codeberg | `codeberg.org/<user>/<repo>` |
| Gitea (self-hosted) | `gitea.*/<user>/<repo>` |
| Sourcehut | `git.sr.ht/~<user>/<repo>` |
 
### Shell variable expansion in PKGBUILDs
 
The config generator and the CI workflow both resolve shell variable references in `source=` lines so that indirect URLs like the following are handled correctly:
 
```bash
_pkgname=${pkgname#athena-}
source=("git+https://github.com/Athena-OS/$_pkgname.git")
```
 
The following bash parameter expansion forms are supported:
 
| Syntax | Meaning | Example |
|---|---|---|
| `$var` / `${var}` | Simple substitution | `$pkgname` → `athena-settings` |
| `${var#prefix}` | Strip shortest matching prefix | `${pkgname#athena-}` → `settings` |
| `${var%suffix}` | Strip shortest matching suffix | `${pkgname%-git}` → `athena-settings` |
 
### Known limitations
 
The following bash constructs are **not** resolved by the automation. PKGBUILDs that rely on them will be skipped gracefully with an informational note — no error is raised, and they can always be updated manually.
 
| Unsupported syntax | Example | Reason |
|---|---|---|
| `##` greedy prefix strip | `${var##*/}` | Only non-greedy `#` is implemented |
| `%%` greedy suffix strip | `${var%%.*}` | Only non-greedy `%` is implemented |
| Substring extraction | `${var:0:3}` | Different operator, rare in PKGBUILDs |
| Pattern substitution | `${var//foo/bar}` | Different operator, rare in PKGBUILDs |
| Arithmetic expansion | `$((pkgver + 1))` | Out of scope for version tracking |
| Nested expansions | `${${var}#prefix}` | Not valid POSIX; not used in practice |
 
If your PKGBUILD uses any of the above and the automation skips it, you can either rewrite the assignment as a plain `var=value` line or open a PR updating the version manually.
