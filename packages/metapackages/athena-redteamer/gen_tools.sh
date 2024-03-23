#!/bin/sh

to_exclude=("seclists" "argus-clients" "xplico" "faradaysec" "inguma" "fuzzdb" "smartphone-pentest-framework" "trape" "binflow" "fastnetmon" "vpnpivot" "wolpertinger" "ncpfs" "sigploit" "archivebox" "witchxtool" "yaaf")

sed -i '/depends=/d' PKGBUILD
sed -i '/^$/d' PKGBUILD #Delete all empty lines

printf 'depends=( ' >> PKGBUILD
printf "'%s' " $(pacman -Sgq athena-cracker athena-database athena-debugger athena-decompiler athena-exploitation athena-fuzzer athena-networking athena-recon athena-scanner athena-sniffer athena-spoof athena-webapp athena-windows | awk '!seen[$0]++' | sort | sed -e "$(sed 's:.*:s/^&$//ig:' <<<$(printf "%s\n" "${to_exclude[@]}"))") >> PKGBUILD
printf ')\n' >> PKGBUILD
