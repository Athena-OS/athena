#!/bin/sh

to_exclude=("argus-clients" "xplico" "gerix-wifi-cracker" "pmacct" "sagan" "fastnetmon" "vpnpivot" "ncpfs")

sed -i '/depends=/d' PKGBUILD
sed -i '/^$/d' PKGBUILD #Delete all empty lines

printf 'depends=( ' >> PKGBUILD
printf "'%s' " $(pacman -Sgq athena-ids athena-networking athena-proxy athena-radio athena-sniffer athena-spoof athena-tunnel athena-wireless | awk '!seen[$0]++' | sort | sed -e "$(sed 's:.*:s/^&$//ig:' <<<$(printf "%s\n" "${to_exclude[@]}"))") >> PKGBUILD
printf ')\n' >> PKGBUILD
