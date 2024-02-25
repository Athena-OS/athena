#!/bin/sh

pkgname=$(grep "^pkgname=" PKGBUILD | awk -F"=" '{print $2}')
pkgrel=$(grep "^pkgrel=" PKGBUILD | awk -F"=" '{split($2,a," ");gsub(/"/, "", a[1]);print a[1]}')
arch=$(grep "^arch=" PKGBUILD | awk -F"'" '{print $2}')

#NEED ONLY TO EDIT  sourcefiles VARIABLE

sourcefiles="etc usr"

#sed -i -e '/^sha256/d' -e '/^sha512/d' PKGBUILD

tar -zcvf $pkgname.tar.gz $sourcefiles 
updpkgsums
#makepkg -g >> PKGBUILD
makepkg -f -scr --noconfirm

pkgver=$(grep "^pkgver=" PKGBUILD | awk -F"=" '{print $2}')
pkgfile=$pkgname-$pkgver-$pkgrel-$arch.pkg.tar.zst
rm -rf src pkg $pkgname.tar.gz

