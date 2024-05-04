#!/usr/bin/env bash

# Function to find directories containing PKGBUILD files
find_pkgbuild_dirs() {
    local pkgbuild_paths=()
    local search_dir="$src_dir"

    # If user input is provided, use it as package names to search for
    if [ $# -gt 0 ]; then
        # Loop through provided package names
        for pkg_name in "$@"; do
            # Use find to locate PKGBUILD files in subdirectories
            while IFS= read -r -d '' pkgbuild_path; do
                # Print the package name and PKGBUILD path
                pkgbuild_paths+=("$pkgbuild_path")
            done < <(find "$search_dir" -type d -name "$pkg_name" -exec find {} -maxdepth 1 -type f -name PKGBUILD -print0 \;)
        done
    else
        # Use find to locate PKGBUILD files in subdirectories
        while IFS= read -r -d '' pkgbuild_path; do
            # Consider only packages not in 'broken' and 'old' directories
            if [[ ! $pkgbuild_path =~ "broken" && ! $pkgbuild_path =~ "old" ]]; then
                # Extract package name from PKGBUILD path
                pkgbuild_paths+=("$pkgbuild_path")
            fi
        done < <(find "$search_dir" -type f -name PKGBUILD -print0)
    fi

    # Return the array of PKGBUILD paths
    echo "${pkgbuild_paths[@]}"
}

update_package_version() {
    pkg_dir=$1
    src_dir=$2

    echo -e "\nUpdating package version in $pkg_dir..."
    cd $pkg_dir

    updpkgsums
    makepkg -do

    git add PKGBUILD
    rm -rf /tmp/makepkg/*

    cd $src_dir
}

src_dir="$(pwd)/../packages" # pwd depends on the dir where the script is stored (currently 'scripts')

# Get user input if provided
if [ "$#" -gt 0 ]; then
    result=($(find_pkgbuild_dirs "$@"))
else
    result=($(find_pkgbuild_dirs))
fi

# Print the result array
for path in "${result[@]}"; do
    echo "Found PKGBUILD: $path"
    # Check if git source
    if grep -q "echo \$(git rev-list --count HEAD)\.\$(git rev-parse --short HEAD)" $path || \
       grep -q "git describe --long --tags" $path; then
        # Update package version
        update_package_version "$(dirname $path)" "$src_dir"
    else
        echo "$path no git source."
    fi
    echo
done

git commit -am "Bump packages"
git push
echo
echo -e "Remember to not push the entire repository to prevent pushing of git source directories. Delete this repository and clone it again instead."