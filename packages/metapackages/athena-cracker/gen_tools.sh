#!/bin/sh

to_exclude=("inguma")

sed -i '/depends=/d' PKGBUILD
sed -i '/^$/d' PKGBUILD #Delete all empty lines

printf 'depends=( ' >> PKGBUILD
printf "'%s' " $(pacman -Sgq athena-cracker athena-crypto | awk '!seen[$0]++' | sort | sed -e "$(sed 's:.*:s/^&$//ig:' <<<$(printf "%s\n" "${to_exclude[@]}"))") >> PKGBUILD
printf "'psudohash' " >> PKGBUILD
printf ')\n' >> PKGBUILD
