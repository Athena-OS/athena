#!/bin/sh

to_exclude=("apkid" "python-yara-rednaga" "ssma" "mobsf" "quickscope" "argus-clients" "qt3" "xplico" "pyqt3" "qscintilla-qt3" "faradaysec" "gerix-wifi-cracker" "inguma" "braces" "facebrok" "pfff" "fuzzdb" "smartphone-pentest-framework" "trape" "sagan" "firefox-security-toolkit" "binflow" "fastnetmon" "radare2-keystone" "tyton" "vpnpivot" "wolpertinger" "sigploit" "ncpfs" "3proxy" "witchxtool" "yaaf" "mana")

sed -i '/depends=/d' PKGBUILD
sed -i '/^$/d' PKGBUILD #Delete all empty lines

printf 'depends=( ' >> PKGBUILD
printf "'%s' " $(pacman -Sgq athena | awk '!seen[$0]++' | sort | sed -e "$(sed 's:.*:s/^&$//ig:' <<<$(printf "%s\n" "${to_exclude[@]}"))") >> PKGBUILD
printf ')\n' >> PKGBUILD
