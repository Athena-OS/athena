#!/bin/sh

if [ ! -f PKGBUILD ]; then
    echo "PKGBUILD not found in the current directory."
    exit 1
fi

read -p "Type the name of dependency you want to check: " target

deps=$(grep "^depends=" PKGBUILD | awk -F"=" '{print $2}' | sed -e "s/[()']//g" -e "s/ /\n/g" | sed '/^$/d')

echo "Checking for nested dependencies"
while read -r dep
do
    echo "Package: $dep"
    list=$(pactree -su $dep)

    while read line
    do
        if [[ "$line" == "$target" ]]; then
            echo "The PKGBUILD dependency "$dep" contains the provided dependency $target."
        fi
    done <<< "$list"
done <<< $deps
