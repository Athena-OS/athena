#!/usr/bin/env python3
"""
generate-nvchecker-config.py
Scans all PKGBUILDs under src/ and auto-generates .nvchecker/nvchecker.toml

Usage:
    python3 .nvchecker/generate-nvchecker-config.py
    python3 .nvchecker/generate-nvchecker-config.py --src-dir src --output .nvchecker/nvchecker.toml
    python3 .nvchecker/generate-nvchecker-config.py --ignore src/misc src/deprecated

Rules:
  - If PKGBUILD has a pkgver() function  -> VCS package  -> tracked by latest commit
  - If source= contains a known host URL -> release pkg  -> tracked by latest release/tag
  - If all sources are local files       -> local pkg    -> skipped silently (no upstream)
  - If source host is unknown            -> skipped with an info note (no error)

Supported platforms:
  GitHub, GitLab (gitlab.com + self-hosted), Codeberg, Gitea, Sourcehut
"""

import argparse
import os
import re
import sys

# -- Argument parsing ----------------------------------------------------------

parser = argparse.ArgumentParser(description="Generate nvchecker.toml from PKGBUILDs")
parser.add_argument("--src-dir", default="src", help="Path to the src/ directory")
parser.add_argument("--output", default=".nvchecker/nvchecker.toml", help="Output file path")
parser.add_argument(
    "--ignore",
    nargs="+",
    default=[],
    metavar="DIR",
    help=(
        "Directories to ignore (and all their subdirectories). "
        "Matched against the full path. "
        "Example: --ignore src/misc src/deprecated"
    ),
)
args = parser.parse_args()

SRC_DIR     = args.src_dir
OUTPUT      = args.output
IGNORE_DIRS = [os.path.normpath(d) for d in args.ignore]

# -- Platform definitions ------------------------------------------------------

PLATFORMS = [
    (
        re.compile(r"github\.com/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)"),
        "github",
        "https://github.com/{repo}.git",
    ),
    (
        re.compile(r"(gitlab\.[a-zA-Z0-9.-]+)/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)"),
        "gitlab",
        None,
    ),
    (
        re.compile(r"codeberg\.org/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)"),
        "git",
        "https://codeberg.org/{repo}.git",
    ),
    (
        re.compile(r"gitea\.[a-zA-Z0-9.-]+/([a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)"),
        "git",
        None,
    ),
    (
        re.compile(r"git\.sr\.ht/(~[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)"),
        "git",
        "https://git.sr.ht/{repo}",
    ),
]

REMOTE_URL_RE = re.compile(r"https?://|git\+")

# -- Helpers -------------------------------------------------------------------

def extract_var(content, varname):
    """Extract a simple scalar variable assignment from a shell script."""
    m = re.search(
        r"^" + re.escape(varname) + r'=["\']?([^"\'\n]+)["\']?',
        content,
        re.MULTILINE,
    )
    return m.group(1).strip() if m else None


def expand_vars(content, text):
    """Expand shell variable references found in content into text."""
    # Collect all simple (non-dynamic) variable assignments, longest first so
    # e.g. $_pkgname is expanded before $_pkg if both exist.
    assignments = {}
    for m in re.finditer(
        r'^([a-zA-Z_][a-zA-Z0-9_]*)=["\']?([^"\'\(\)\n]+)["\']?',
        content,
        re.MULTILINE,
    ):
        varname, value = m.group(1), m.group(2).strip()
        if len(value) < 200 and "$" not in value:
            assignments[varname] = value

    # Expand longest variable names first to avoid partial substitutions
    for varname in sorted(assignments, key=len, reverse=True):
        value = assignments[varname]
        text = text.replace("${" + varname + "}", value)
        text = text.replace("$" + varname, value)

    return text


def is_ignored(path):
    """Return True if path is inside any of the ignored directories."""
    norm = os.path.normpath(path)
    for ig in IGNORE_DIRS:
        if norm == ig or norm.startswith(ig + os.sep):
            return True
    return False


def has_only_local_sources(content):
    """Return True when every source line is a local file (no http/git+ URL)."""
    in_block = False
    has_source = False
    for line in content.splitlines():
        stripped = line.strip()
        if re.match(r"source[_a-z0-9]*\s*=\s*\(", stripped):
            in_block = True
            has_source = True
        if in_block:
            if REMOTE_URL_RE.search(stripped):
                return False
            if ")" in stripped and stripped.index(")") > stripped.find("(") or (
                ")" in stripped and not stripped.startswith("source")
            ):
                in_block = False
    return has_source  # only "local" if we found a source block at all


def is_vcs_package(content):
    """Return True when the PKGBUILD declares a pkgver() function."""
    return bool(re.search(r"^pkgver\s*\(\)", content, re.MULTILINE))


def find_source_info(content):
    """
    Scan candidate lines for a recognisable hosting platform URL and return a
    dict with platform metadata, or None if nothing is found.
    """
    # Expand variable references in the whole file content first so that
    # patterns like source=("git+https://github.com/$_user/$_repo.git") resolve.
    expanded_content = expand_vars(content, content)

    # Gather candidate lines: explicit helper vars + source= lines
    candidates = []
    for line in expanded_content.splitlines():
        if re.match(r"\s*(_ghurl|_giturl|_url|url|source)\s*[=(]", line):
            candidates.append(line)

    has_v = bool(re.search(r"/v\$\{?pkgver\}?", content))

    for expanded in candidates:
        for pattern, nvchecker_src, git_tmpl in PLATFORMS:
            m = pattern.search(expanded)
            if not m:
                continue

            if nvchecker_src == "gitlab":
                host = m.group(1)
                repo = re.sub(r"\.git$", "", m.group(2).rstrip("/"))
                return {
                    "platform":     "gitlab",
                    "repo":         repo,
                    "host":         host,
                    "git_url":      f"https://{host}/{repo}.git",
                    "has_v_prefix": has_v,
                }
            else:
                repo = re.sub(r"\.git$", "", m.group(1).rstrip("/"))
                if git_tmpl:
                    git_url = git_tmpl.format(repo=repo)
                else:
                    raw = re.search(r"https?://\S+", expanded)
                    git_url = (re.sub(r"\.git$", "", raw.group(0)) + ".git") if raw else ""
                return {
                    "platform":     nvchecker_src,
                    "repo":         repo,
                    "host":         None,
                    "git_url":      git_url,
                    "has_v_prefix": has_v,
                }

    return None


# -- Scan PKGBUILDs ------------------------------------------------------------

release_packages = []   # list of (pkgname, info)
vcs_packages     = []   # list of (pkgname, info)
local_packages   = []   # list of pkgname strings
skipped          = []   # list of (identifier, reason)

seen_pkgnames = set()   # track duplicates across all categories

for root, dirs, files in os.walk(SRC_DIR):
    # Prune ignored directories in-place so os.walk won't descend into them
    dirs[:] = sorted(
        d for d in dirs
        if not is_ignored(os.path.join(root, d))
    )

    if "PKGBUILD" not in files:
        continue

    pkgbuild_path = os.path.join(root, "PKGBUILD")
    try:
        with open(pkgbuild_path) as f:
            content = f.read()
    except OSError as e:
        skipped.append((pkgbuild_path, f"could not read file: {e}"))
        continue

    pkgname = extract_var(content, "pkgname")
    if not pkgname:
        skipped.append((pkgbuild_path, "could not parse pkgname"))
        continue

    # Expand variable references (e.g. pkgname=$_pkgname)
    pkgname = expand_vars(content, pkgname).strip('"\'{}')

    # If pkgname still contains a $ it could not be resolved — skip it
    if "$" in pkgname:
        skipped.append((pkgbuild_path, f"could not resolve pkgname variable: {pkgname}"))
        continue

    # Detect duplicates across all categories
    if pkgname in seen_pkgnames:
        skipped.append((pkgbuild_path, f"duplicate pkgname '{pkgname}', skipping"))
        continue
    seen_pkgnames.add(pkgname)

    if has_only_local_sources(content):
        local_packages.append(pkgname)
        continue

    info = find_source_info(content)

    if is_vcs_package(content):
        if info:
            vcs_packages.append((pkgname, info))
        else:
            skipped.append((pkgname, "VCS package but no known hosting platform found in source="))
    else:
        if info:
            release_packages.append((pkgname, info))
        else:
            skipped.append((pkgname, "no known hosting platform found in source="))

# -- Write nvchecker.toml ------------------------------------------------------

os.makedirs(os.path.dirname(os.path.abspath(OUTPUT)), exist_ok=True)

with open(OUTPUT, "w") as f:
    f.write("# nvchecker configuration for Athena OS packages\n")
    f.write("# Auto-generated by .nvchecker/generate-nvchecker-config.py — do not edit manually\n")
    f.write("# Re-run the script after adding or removing packages\n")
    f.write("#\n")
    f.write("# Run manually (from repo root):\n")
    f.write("#   nvchecker -c .nvchecker/nvchecker.toml\n")
    f.write("#   nvdiff .nvchecker/oldver.json .nvchecker/newver.json\n")
    f.write("\n")
    f.write("[__config__]\n")
    # Paths are relative to the directory containing nvchecker.toml (.nvchecker/)
    f.write('oldver = "oldver.json"\n')
    f.write('newver = "newver.json"\n')
    f.write('keyfile = "keyfile.toml"\n')

    if release_packages:
        f.write("\n\n# -- Release packages " + "-" * 60 + "\n\n")
        for pkgname, info in sorted(release_packages, key=lambda x: x[0]):
            f.write(f"[{pkgname}]\n")
            if info["platform"] == "github":
                f.write('source = "github"\n')
                f.write(f'github = "{info["repo"]}"\n')
                f.write("use_max_tag = true\n")
                if info["has_v_prefix"]:
                    f.write('prefix = "v"\n')
            elif info["platform"] == "gitlab":
                f.write('source = "gitlab"\n')
                f.write(f'gitlab = "{info["repo"]}"\n')
                if info["host"] != "gitlab.com":
                    f.write(f'host = "https://{info["host"]}"\n')
                f.write("use_max_tag = true\n")
                if info["has_v_prefix"]:
                    f.write('prefix = "v"\n')
            else:
                f.write('source = "git"\n')
                f.write(f'git = "{info["git_url"]}"\n')
                f.write('use = "tag"\n')
                if info["has_v_prefix"]:
                    f.write('prefix = "v"\n')
            f.write("\n")

    if vcs_packages:
        f.write("\n# -- VCS packages (pkgver() computed by makepkg) " + "-" * 32 + "\n\n")
        for pkgname, info in sorted(vcs_packages, key=lambda x: x[0]):
            f.write(f"[{pkgname}]\n")
            f.write('source = "git"\n')
            f.write(f'git = "{info["git_url"]}"\n')
            f.write('use_commit = true\n')
            f.write("\n")

# -- Summary -------------------------------------------------------------------

print(f"Generated {OUTPUT}")
print(f"  Release packages : {len(release_packages)}")
print(f"  VCS packages     : {len(vcs_packages)}")
print(f"  Local-only       : {len(local_packages)} (no upstream, skipped silently)")
if local_packages:
    print(f"  => {', '.join(sorted(local_packages))}")

if skipped:
    print(f"\n[INFO] {len(skipped)} package(s) have no detectable upstream and were skipped:")
    for name, reason in skipped:
        print(f"  - {name}: {reason}")

print("\nDone.")
