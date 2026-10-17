#!/bin/bash
#
# Build an Arch Linux based ISO with archiso.
#
# The distro identity (name, version, arch) is read from the profile's
# profiledef.sh and can be overridden on the command line or via env vars.
#
# Usage: ./build-iso.sh [options]
#

set -euo pipefail

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
scriptDir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
repoDir="$(cd "$scriptDir/.." && pwd)"

# ---------------------------------------------------------------------------
# Defaults (env vars: ISO_PROFILE, ISO_NAME, ISO_VERSION, ISO_ARCH,
#           ISO_BUILD_DIR, ISO_OUT_DIR, ISO_CHECKSUMS)
# ---------------------------------------------------------------------------
profileDir="${ISO_PROFILE:-$repoDir/iso}"
name="${ISO_NAME:-}"            # empty = take from profiledef.sh
version="${ISO_VERSION:-}"      # empty = take from profiledef.sh
arch="${ISO_ARCH:-}"            # empty = take from profiledef.sh
buildDir="${ISO_BUILD_DIR:-}"   # empty = <repo>/build
outDir="${ISO_OUT_DIR:-}"       # empty = <repo>/out
checksums="${ISO_CHECKSUMS:-sha256 sha512}"
releaseFile="etc/dev-rel"       # relative to airootfs, optional
cleanCache="no"
keepBuild="no"
verbose="-v"

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
color() { tput setaf "$1" 2> /dev/null || true; }
reset() { tput sgr0 2> /dev/null || true; }

die() {
  color 1; echo "ERROR: $*" >&2; reset
  exit 1
}

warn() {
  color 3; echo "WARNING: $*" >&2; reset
}

phase() {
  echo
  echo "##################################################################"
  color 2
  echo "$1"
  shift
  for line in "$@"; do echo "- $line"; done
  reset
  echo "##################################################################"
  echo
}

usage() {
  cat << EOF
Usage: $(basename "$0") [options]

Options:
  -p, --profile DIR       archiso profile directory (default: $profileDir)
  -n, --name NAME         ISO name prefix        (default: iso_name from profiledef.sh)
  -V, --version VERSION   ISO version string     (default: iso_version from profiledef.sh)
  -a, --arch ARCH         Architecture           (default: arch from profiledef.sh)
  -b, --build-dir DIR     Build/work directory   (default: $repoDir/build)
  -o, --out-dir DIR       Output directory       (default: $repoDir/out)
      --checksums LIST    Space separated list   (default: "$checksums")
                          Any of: md5 sha1 sha256 sha512 b2
      --release-file PATH File inside airootfs to stamp with build date/version
                          (default: $releaseFile, skipped if missing)
      --clean-cache       Run 'pacman -Scc' before building (slow, redownloads everything)
      --keep-build        Keep the build directory after building
  -q, --quiet             Less mkarchiso output
  -h, --help              Show this help

Environment variables with the same meaning:
  ISO_PROFILE ISO_NAME ISO_VERSION ISO_ARCH ISO_BUILD_DIR ISO_OUT_DIR ISO_CHECKSUMS

Examples:
  $(basename "$0")
  $(basename "$0") -V 2026.10.17 --keep-build
  $(basename "$0") --profile ./iso --out-dir /srv/iso
EOF
}

need_value() {
  [ -n "${2:-}" ] && [ "${2:0:1}" != "-" ] || die "Option '$1' requires a value"
}

# Run as root without sudo noise if we already are root
if [ "$EUID" -eq 0 ]; then
  sudo_cmd() { "$@"; }
else
  command -v sudo > /dev/null || die "sudo is required (or run as root)"
  sudo_cmd() { sudo "$@"; }
fi

# Read a variable from profiledef.sh without polluting our environment
profiledef_var() {
  ( # shellcheck disable=SC1090
    declare -A file_permissions
    source "$profileDir/profiledef.sh" && printf '%s' "${!1:-}" )
}

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    -p|--profile)      need_value "$1" "${2:-}"; profileDir="$2"; shift 2 ;;
    --profile=*)       profileDir="${1#*=}"; shift ;;
    -n|--name)         need_value "$1" "${2:-}"; name="$2"; shift 2 ;;
    --name=*)          name="${1#*=}"; shift ;;
    -V|--version)      need_value "$1" "${2:-}"; version="$2"; shift 2 ;;
    --version=*)       version="${1#*=}"; shift ;;
    -a|--arch)         need_value "$1" "${2:-}"; arch="$2"; shift 2 ;;
    --arch=*)          arch="${1#*=}"; shift ;;
    -b|--build-dir)    need_value "$1" "${2:-}"; buildDir="$2"; shift 2 ;;
    --build-dir=*)     buildDir="${1#*=}"; shift ;;
    -o|--out-dir)      need_value "$1" "${2:-}"; outDir="$2"; shift 2 ;;
    --out-dir=*)       outDir="${1#*=}"; shift ;;
    --checksums)       need_value "$1" "${2:-}"; checksums="$2"; shift 2 ;;
    --checksums=*)     checksums="${1#*=}"; shift ;;
    --release-file)    need_value "$1" "${2:-}"; releaseFile="$2"; shift 2 ;;
    --release-file=*)  releaseFile="${1#*=}"; shift ;;
    --clean-cache)     cleanCache="yes"; shift ;;
    --keep-build)      keepBuild="yes"; shift ;;
    -q|--quiet)        verbose=""; shift ;;
    -h|--help)         usage; exit 0 ;;
    *)                 usage; echo; die "Unknown option: $1" ;;
  esac
done

# ---------------------------------------------------------------------------
# Validation
# ---------------------------------------------------------------------------
profileDir="$(cd "$profileDir" 2> /dev/null && pwd)" || die "Profile directory not found: $profileDir"
[ -f "$profileDir/profiledef.sh" ] || die "Not an archiso profile (missing profiledef.sh): $profileDir"

name="${name:-$(profiledef_var iso_name)}"
version="${version:-$(profiledef_var iso_version)}"
arch="${arch:-$(profiledef_var arch)}"
[ -n "$name" ]    || die "iso_name is not set in profiledef.sh and no --name given"
[ -n "$version" ] || die "iso_version is not set in profiledef.sh and no --version given"
[ -n "$arch" ]    || die "arch is not set in profiledef.sh and no --arch given"
[ -f "$profileDir/packages.$arch" ] || die "Missing package list: $profileDir/packages.$arch"

for algo in $checksums; do
  command -v "${algo}sum" > /dev/null || die "Checksum tool not found: ${algo}sum"
done

buildDir="${buildDir:-$repoDir/build}"
outDir="${outDir:-$repoDir/out}"
workDir="$buildDir/work"
profileCopy="$buildDir/profile"
isoFile="$name-$version-$arch.iso"

# ---------------------------------------------------------------------------
phase "Phase 1 :" "Checking archiso" "Setting general parameters"
# ---------------------------------------------------------------------------
if ! pacman -Qi archiso &> /dev/null; then
  echo "archiso is not installed, installing it now"
  sudo_cmd pacman -S --needed --noconfirm archiso
fi
archisoVersion="$(pacman -Q archiso)"

printf '%-30s: %s\n' \
  "Profile"           "$profileDir" \
  "ISO name"          "$name" \
  "ISO version"       "$version" \
  "Architecture"      "$arch" \
  "ISO file"          "$isoFile" \
  "archiso"           "$archisoVersion" \
  "Build directory"   "$buildDir" \
  "Output directory"  "$outDir" \
  "Checksums"         "$checksums"

# ---------------------------------------------------------------------------
phase "Phase 2 :" "Preparing a clean build directory" "Copying the profile"
# ---------------------------------------------------------------------------
cleanup() {
  if [ "$keepBuild" != "yes" ] && [ -d "$buildDir" ]; then
    echo "Removing build directory $buildDir"
    sudo_cmd rm -rf -- "$buildDir"
  fi
}
trap cleanup EXIT

[ -d "$buildDir" ] && sudo_cmd rm -rf -- "$buildDir"
mkdir -p -- "$workDir" "$outDir"
cp -a -- "$profileDir" "$profileCopy"

# Apply name/version/arch overrides to the copied profiledef.sh so mkarchiso
# produces exactly the file name we expect (no renaming afterwards).
sed -i \
  -e "s|^iso_name=.*|iso_name=\"$name\"|" \
  -e "s|^iso_version=.*|iso_version=\"$version\"|" \
  -e "s|^arch=.*|arch=\"$arch\"|" \
  "$profileCopy/profiledef.sh"

# ---------------------------------------------------------------------------
phase "Phase 3 :" "Stamping build information"
# ---------------------------------------------------------------------------
buildDate="$(date -u '+%Y-%m-%d %H:%M:%S UTC')"
relPath="$profileCopy/airootfs/$releaseFile"
if [ -f "$relPath" ]; then
  echo "Updating $releaseFile (built $buildDate)"
  sed -i \
    -e "s|^ISO_BUILD=.*|ISO_BUILD=$buildDate|" \
    -e "s|^ISO_RELEASE=.*|ISO_RELEASE=$version|" \
    "$relPath"
else
  echo "No airootfs/$releaseFile in profile, skipping"
fi

# ---------------------------------------------------------------------------
if [ "$cleanCache" == "yes" ]; then
  phase "Phase 4 :" "Cleaning the pacman package cache"
  sudo_cmd pacman -Scc --noconfirm || warn "pacman -Scc failed, continuing"
else
  phase "Phase 4 :" "Keeping the pacman package cache (use --clean-cache to wipe it)"
fi

# ---------------------------------------------------------------------------
phase "Phase 5 :" "Building $isoFile - this can take a while"
# ---------------------------------------------------------------------------
# shellcheck disable=SC2086
sudo_cmd mkarchiso $verbose -w "$workDir" -o "$outDir" "$profileCopy"

[ -f "$outDir/$isoFile" ] || die "mkarchiso finished but $outDir/$isoFile was not created"

# Hand the ISO back to the invoking user when running through sudo
owner="${SUDO_UID:-$(id -u)}:${SUDO_GID:-$(id -g)}"
sudo_cmd chown "$owner" -- "$outDir/$isoFile"

# ---------------------------------------------------------------------------
phase "Phase 6 :" "Creating checksums for $isoFile"
# ---------------------------------------------------------------------------
( cd -- "$outDir"   # keeps absolute paths out of the checksum files
  for algo in $checksums; do
    echo "Creating ${algo}sum"
    "${algo}sum" -- "$isoFile" | tee "$isoFile.$algo"
    sudo_cmd chown "$owner" -- "$isoFile.$algo"
  done )

# ---------------------------------------------------------------------------
phase "Phase 7 :" "$( [ "$keepBuild" == "yes" ] && echo "Keeping build directory: $buildDir" || echo "Build directory will be removed" )"
# ---------------------------------------------------------------------------
color 2
echo "DONE"
echo "ISO: $outDir/$isoFile"
reset
