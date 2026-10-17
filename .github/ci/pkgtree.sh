#!/usr/bin/env bash
# pkgtree.sh <src-dir> <out-dir>
#
# Athena keeps PKGBUILDs in nested directories (src/<category>/.../<name>/).
# The CI scripts work on a flat "<name>/PKGBUILD" layout, so this builds one
# with symlinks: <out-dir>/<name> -> ../src/.../<name>, and writes
# <out-dir>.map ("<name> <real dir>" per line) for the scripts that must
# commit to the real path. Package directory names must be unique.
set -euo pipefail
src=$1 out=$2
rm -rf "$out"; mkdir -p "$out"; : > "$out.map"
dup=0
while IFS= read -r f; do
  dir=${f%/PKGBUILD}; name=${dir##*/}
  if [[ -e $out/$name ]]; then
    echo "::error::two packages named '$name': $(readlink "$out/$name") and $dir"; dup=1; continue
  fi
  ln -s "$(realpath --relative-to="$out" "$dir")" "$out/$name"
  echo "$name $dir" >> "$out.map"
done < <(find "$src" -name PKGBUILD -not -path '*/.*' | sort)
(( dup == 0 )) || exit 1
echo "package tree: $(wc -l < "$out.map") packages -> $out"
