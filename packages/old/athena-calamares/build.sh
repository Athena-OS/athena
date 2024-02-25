#!/bin/sh
echo "################################################################"
echo "################### Making the package"
echo "################################################################"
makepkg -f -scr --noconfirm
#yes| paru -c
echo "################################################################"
echo "################### Moved the .zst file to x86_64 folder"
echo "################################################################"
find . -type d -not -path "." -exec sudo rm -r "{}" \;
find . -type f -not -name "build.sh" -not -name "*.install" -not -name PKGBUILD -not -name  "49-nopasswd-calamares.rules" -not -name "calamares_polkit" -not -name "calamares.desktop" -not -name "*.pkg.tar.zst*" -delete
echo "################################################################"
echo "################### Removed all redundant files and folders"
echo "################################################################"
