#!/bin/sh

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <Athena Repository path>"
    exit 1
fi

repo_path=$1

if [ ! -d "$repo_path" ];
then
    echo "$repo_path directory does not exist."
    exit 1
fi

arr_pkg=( $(ls | grep -E '\.zst$') )
len=$((${#arr_pkg[@]} - 1))

eval $(gpg-agent --daemon)
gpg --armor --export-secret-keys | gpg --import --allow-secret-key-import -

for i in $(seq 0 $len)
do
    ##echo ${arr_pkg[$i]}
    filename=${arr_pkg[$i]}
    replace=$(echo $filename | sed -r 's/([a-z]+)-([0-9]{1,4}\..*)-([a-z0-9_]+\.pkg\.tar\.zst)/\1-*-\3/') # find string with a number with 1 or 2 or 3 or 4 digits followed by . and then the string pkg.tar.zst. It will replace <pkgname>-1.0.1-1.any.pkg.zst by <pkgname>-*.any.pkg.zst
    #rm -rf $repo_path/x86_64/$replace $repo_path/x86_64/$replace.sig $repo_path/aarch64/$replace $repo_path/aarch64/$replace.sig
    echo "Removing $replace from $repo_path/x86_64/$replace"
    rm -rf ./$filename.sig $repo_path/x86_64/$replace $repo_path/x86_64/$replace.sig
    gpg --detach-sign --use-agent --output $filename.sig $filename
    cp -rf $filename $filename.sig $repo_path/x86_64/
    #cp -rf $filename $filename.sig $repo_path/aarch64/
    ##rm -rf $filename $filename.sig
    echo "$filename package moved to $repo_path repository."
done

