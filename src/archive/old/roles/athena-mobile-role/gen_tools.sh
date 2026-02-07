#!/bin/sh

to_exclude=("apkid" "mobsf" "quickscope" "smartphone-pentest-framework" "radare2-keystone" "sigploit")

sed -i '/depends=/d' PKGBUILD
sed -i '/^$/d' PKGBUILD #Delete all empty lines

printf 'depends=( ' >> PKGBUILD
printf "'%s' " $(pacman -Sgq athena-mobile athena-reversing | awk '!seen[$0]++' | sort | sed -e "$(sed 's:.*:s/^&$//ig:' <<<$(printf "%s\n" "${to_exclude[@]}"))") >> PKGBUILD
printf ')\n' >> PKGBUILD
