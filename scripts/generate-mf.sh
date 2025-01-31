#!/bin/sh
# Credits Kali Linux ( https://www.kali.org/ )

set -eu

sha=sha1
SHA=SHA1

fail() { echo "$@" >&2; exit 1; }
usage() { fail "Usage: $(basename $0) [-s sha1|sha256] OVF VMDK"; }

# Validate arguments

while [ $# -gt 0 ]; do
    case $1 in
        -s)
            shift
            sha=$1
            SHA=$(echo $1 | tr '[:lower:]' '[:upper:]')
            ;;
        *) break ;;
    esac
    shift
done

[ $# -eq 2 ] || usage

ovf=$1
vmdk=$2

[ ${ovf##*.} = ovf ] || fail "Invalid input file '$ovf'"
[ ${vmdk##*.} = vmdk ] || fail "Invalid input file '$vmdk'"

# Create the manifest (.mf)

mf=${ovf%.*}.mf

ovf_sha=$(${sha}sum $ovf | awk '{print $1}')
vmdk_sha=$(${sha}sum $vmdk | awk '{print $1}')

cat << EOF > $mf
$SHA ($(basename $ovf)) = $ovf_sha
$SHA ($(basename $vmdk)) = $vmdk_sha
EOF
