#!/bin/bash
# Credits Kali Linux ( https://www.kali.org/ )

set -eu

# Helpers

fail() { echo "$@" >&2; exit 1; }
usage() { fail "Usage: $(basename $0) VDI"; }

get_vdi_disk_uuid() {

    # Get the UUID of a .vdi disk
    # (should propose this feature to 'qemu-img info')

    local disk=$1
    local p1= p2= p3= p4= p5=

    p1=$(od -An -tx4 -j 0x188 -N4 $disk | tr -d " ")
    p2=$(od -An -tx2 -j 0x18c -N2 $disk | tr -d " ")
    p3=$(od -An -tx2 -j 0x18e -N2 $disk | tr -d " ")
    p4=$(od -An -tx2 -j 0x190 -N2 --endian=big $disk | tr -d " ")
    p5=$(od -An -tx2 -j 0x192 -N6 --endian=big $disk | tr -d " ")

    echo $p1-$p2-$p3-$p4-$p5
}

gen_vbox_mac_address() {

    # Generate a MAC address for a VirtualBox machine.
    # Starting with VirtualBox 5.2, it's in the range 08:00:27.
    # Cf. https://macaddress.io/faq/how-to-recognise-an-oracle-virtual-machine-by-its-mac-address

    local p1= p2=

    p1=080027
    p2=$(od -An -tx1 -N3 /dev/urandom | tr "[a-z]" "[A-Z]" | tr -d " ")

    echo $p1$p2
}

# Validate arguments

[ $# -eq 1 ] || usage

disk_path=$1

[ ${disk_path##*.} = vdi ] || fail "Invalid input file '$disk_path'"

description_template=$RECIPEDIR/scripts/templates/vm-description.txt
machine_template=$RECIPEDIR/scripts/templates/vm-definition.vbox

# Prepare all the values

disk_file=$(basename $disk_path)
name=${disk_file%.*}

arch=${name##*-}
[ "$arch" ] || fail "Failed to get arch from image name '$name'"
version=$(echo $name | sed -E 's/^athena-(.+)-.+-.+$/\1/')
[ "$version" ] || fail "Failed to get version from image name '$name'"

mac_address=$(gen_vbox_mac_address)
disk_uuid=$(get_vdi_disk_uuid $disk_path)
machine_uuid=$(cat /proc/sys/kernel/random/uuid)

case $arch in
    amd64|x86_64)
        long_mode=true
        os_type=Linux_64
        platform=x64
        ;;
    *)
        fail "Invalid architecture '$arch'"
        ;;
esac

# Create the description

description=$(sed \
    -e "s|%date%|$(date --iso-8601)|g" \
    -e "s|%kbdlayout%|US keyboard layout|g" \
    -e "s|%platform%|$platform|g" \
    -e "s|%version%|$version|g" \
    $description_template)

# Create the .vbox file

output=${disk_path%.*}.vbox

sed \
    -e "s|%DiskFile%|$disk_file|g" \
    -e "s|%DiskUUID%|$disk_uuid|g" \
    -e "s|%LongMode%|$long_mode|g" \
    -e "s|%MACAddress%|$mac_address|g" \
    -e "s|%MachineName%|$name|g" \
    -e "s|%MachineUUID%|$machine_uuid|g" \
    -e "s|%OSType%|$os_type|g" \
    $machine_template > $output

awk -v r="$description" '{ gsub(/%Description%/,r); print }' $output > $output.1
mv $output.1 $output

unmatched_patterns=$(grep -E -n "%[A-Za-z_]+%" $output || :)
if [ "$unmatched_patterns" ]; then
    echo "Some patterns were not replaced in '$output':" >&2
    echo "$unmatched_patterns" >&2
    exit 1
fi
