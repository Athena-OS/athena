#!/bin/bash

# If not existing, create the builder user:
# useradd -m -d /src -G wheel -g users builder -s /bin/bash
# echo "builder ALL=(ALL) NOPASSWD: ALL" | tee -a /etc/sudoers
# chown -R builder .

# Function to find directories containing PKGBUILD files
find_pkgbuild_dirs() {
    root_path=$1
    pkg_dirs=()

    # Recursively traverse the root path and look for "PKGBUILD" files in each directory.
    while IFS= read -r -d '' path; do
        if [[ ! $path == *"metapackages"* ]]; then
            pkg_dirs+=("$path")
        fi
    done < <(find "$root_path" -type f -name "PKGBUILD" -print0)

    echo "${pkg_dirs[@]}"
}

# Function to build and sign packages
build_and_sign_packages() {
    cpu_arch=$1
    src_dir=$2
    root_path=$3
    
    for pkg_dir in "${pkg_dirs[@]}"; do
        echo -e "\nBuilding and signing packages in $pkg_dir..."
        current_dir=$(dirname $pkg_dir)
        cd $current_dir
        
        #makepkg -f -scr --noconfirm
        #./build.sh
        
        pkgname=$(grep "^pkgname=" PKGBUILD | awk -F"=" '{print $2}' | sed -e 's/^"\|'\''//g' -e 's/"\|'\''$//g')
        pkgrel=$(grep "^pkgrel=" PKGBUILD | awk -F"=" '{split($2,a," ");gsub(/"/, "", a[1]);print a[1]}' | sed -e 's/^"\|'\''//g' -e 's/"\|'\''$//g')
        arch=$(awk -v cpu_arch="$cpu_arch" -F"[' ]" '/^arch=\(/ { for (i=2; i<=NF; i++) if ($i == cpu_arch || $i == "any") print $i }' PKGBUILD)
        if [ -f "build.sh" ]; then
            ./build.sh
        else
            updpkgsums
            makepkg -f -src --noconfirm
            rm -rf src pkg
        fi
        pkgver=$(grep "^pkgver=" PKGBUILD | awk -F"=" '{print $2}' | sed -e 's/^"\|'\''//g' -e 's/"\|'\''$//g')
        pkgfile=$pkgname-$pkgver-$pkgrel-$arch.pkg.tar.zst
   
        passphrase="${PASSPHRASE:-$(secret-tool lookup key-sec key-sec)}" # If PASSPHRASE is unset or null, it expands to the specified default value (in this case, the result of the secret-tool command). If you need to set it by secret-tool: secret-tool store --label='key sec' key-sec key-sec

        if id "builder" >/dev/null 2>&1; then
            user="builder"
        else
            user="$(whoami)"
        fi

        if [ -n "$passphrase" ]; then
            echo $passphrase | sudo -E -u $user gpg --detach-sign --use-agent --pinentry-mode loopback --passphrase --passphrase-fd 0 --output $pkgfile.sig $pkgfile
        else
            echo "Error: 'PASSPHRASE' environment variable not set."
            break
        fi

        echo -e "Moving $pkgfile $pkgfile.sig to $src_dir"
        mv $pkgfile $pkgfile.sig $src_dir
        cd $root_path
    done
}

# Parse command-line options
while getopts "hp:" opt; do
    case $opt in
        h)
            echo "Usage: $0 [-p path ...]"
            exit 0
            ;;
        p)
            root_path="$OPTARG"
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            exit 1
            ;;
    esac
done

# Set the CPU Architecture for packaging
cpu_arch="x86_64"

# src_dir is package_source dir
src_dir="$(pwd)"

# Check if root_path is empty, assign a default value if needed
if [ -z "$root_path" ]; then
    root_path="$src_dir/packages/"
fi

# Find directories containing PKGBUILD files
pkg_dirs=($(find_pkgbuild_dirs "$root_path"))

if [ "${#pkg_dirs[@]}" -eq 0 ]; then
    echo "No directories containing PKGBUILD found."
    exit 1
fi

echo "Directories containing PKGBUILD found:"
printf '%s\n' "${pkg_dirs[@]}"

# Build and sign packages
build_and_sign_packages "$cpu_arch" "$src_dir" "$root_path"