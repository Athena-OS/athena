#!/bin/bash
#set -e
##################################################################################################################
# Author        :       Erik Dubois
# Website       :       https://www.erikdubois.be
# Website       :       https://www.arcolinux.info
# Website       :       https://www.arcolinux.com
# Website       :       https://www.arcolinuxd.com
# Website       :       https://www.arcolinuxb.com
# Website       :       https://www.arcolinuxiso.com
# Website       :       https://www.arcolinuxforum.com
##################################################################################################################
#
#   DO NOT JUST RUN THIS. EXAMINE AND JUDGE. RUN AT YOUR OWN RISK.
#
##################################################################################################################
echo
echo "################################################################## "
tput setaf 2
echo "Phase 1 : "
echo "- Setting General parameters"
tput sgr0
echo "################################################################## "
echo

        #Let us set the desktop"
        #First letter of desktop is small letter

        desktop="none"
        dmDesktop="none"

        athenaVersion='live'

        isoLabel='athenaos-'$athenaVersion'-x86_64.iso'

        # setting of the general parameters
        archisoRequiredVersion="archiso 86-1"
        buildFolder=$HOME"/athena-build"
        outFolder=$HOME"/Athena-Out"
        # outFolder="/mnt/hgfs/VirtualShare/Athena-Out"
        archisoVersion=$(sudo pacman -Q archiso)

        # If you are ready to use your personal repo and personal packages
        # https://arcolinux.com/use-our-knowledge-and-create-your-own-icon-theme-combo-use-github-to-saveguard-your-work/
        # 1. set variable personalrepo to true in this file (default:false)
        # 2. change the file personal-repo to reflect your repo
        # 3. add your applications to the file packages-personal-repo.x86_64

        personalrepo=false

        echo "################################################################## "
        echo "Building the desktop                   : "$desktop
        echo "Building version                       : "$athenaVersion
        echo "Iso label                              : "$isoLabel
        echo "Do you have the right archiso version? : "$archisoVersion
        echo "What is the required archiso version?  : "$archisoRequiredVersion
        echo "Build folder                           : "$buildFolder
        echo "Out folder                             : "$outFolder
        echo "################################################################## "

        if [ "$archisoVersion" == "$archisoRequiredVersion" ]; then
                tput setaf 2
                echo "##################################################################"
                echo "Archiso has the correct version. Continuing ..."
                echo "##################################################################"
                tput sgr0
        else
        tput setaf 1
        echo "###################################################################################################"
        echo "You need to install the correct version of Archiso"
        echo "Use 'sudo downgrade archiso' to do that"
        echo "or update your system"
        echo "###################################################################################################"
        tput sgr0
        fi

echo
echo "################################################################## "
tput setaf 2
echo "Phase 2 :"
echo "- Checking if archiso is installed"
echo "- Saving current archiso version to readme"
echo "- Making mkarchiso verbose"
tput sgr0
echo "################################################################## "
echo

        package="archiso"

        #----------------------------------------------------------------------------------

        #checking if application is already installed or else install with aur helpers
        if pacman -Qi $package &> /dev/null; then

                        echo "Archiso is already installed"

        else
                        sudo pacman -S --noconfirm archiso
                #checking which helper is installed
                #if pacman -Qi yay &> /dev/null; then

                #       echo "################################################################"
                #       echo "######### Installing with yay"
                #       echo "################################################################"
                #       yay -S --noconfirm $package

                #elif pacman -Qi trizen &> /dev/null; then

                #       echo "################################################################"
                #       echo "######### Installing with trizen"
                #       echo "################################################################"
                #       trizen -S --noconfirm --needed --noedit $package

                #elif pacman -Qi paru &> /dev/null; then

        #                echo "################################################################"
        #                echo "######### Installing with paru"
        #                echo "################################################################"
        #                paru -S --noconfirm --needed $package

        #        fi

                # Just checking if installation was successful
                if pacman -Qi $package &> /dev/null; then

                        echo "################################################################"
                        echo "#########  "$package" has been installed"
                        echo "################################################################"

                else

                        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                        echo "!!!!!!!!!  "$package" has NOT been installed"
                        echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
                        exit 1
                fi

        fi

        echo
        echo "Saving current archiso version to readme"
        sudo sed -i "s/\(^archiso-version=\).*/\1$archisoVersion/" ../archiso.readme
        echo
        echo "Making mkarchiso verbose"
        sudo sed -i 's/quiet="y"/quiet="n"/g' /usr/bin/mkarchiso

echo
echo "################################################################## "
tput setaf 2
echo "Phase 3 :"
echo "- Deleting the build folder if one exists"
echo "- Copying the Archiso folder to build folder"
tput sgr0
echo "################################################################## "
echo

        echo "Deleting the build folder if one exists - takes some time"
        [ -d $buildFolder ] && sudo rm -rf $buildFolder
        echo
        echo "Copying the Archiso folder to build work"
        echo
        mkdir $buildFolder
        cp -r ../iso/* $buildFolder/

echo
echo "################################################################## "
tput setaf 2
echo "Phase 4 :"
echo "- Deleting any files in /etc/skel"
echo "- Getting the last version of bashrc in /etc/skel"
echo "- Removing the old packages.x86_64 file from build folder"
echo "- Copying the new packages.x86_64 file to the build folder"
echo "- Add our own personal repo + add your packages to packages-personal-repo.x86_64"
tput sgr0
echo "################################################################## "
echo

        echo "Deleting any files in /etc/skel"
        rm -rf $buildFolder/airootfs/etc/skel/.bashrc 2> /dev/null
        echo

        echo "Getting the last version of bashrc in /etc/skel"
        echo
        wget https://raw.githubusercontent.com/Athena-OS/athena/main/iso/airootfs/etc/skel/.bashrc -O $buildFolder/airootfs/etc/skel/.bashrc

        echo "Removing the old packages.x86_64 file from build folder"
        rm $buildFolder/packages.x86_64
        #rm $buildFolder/packages-personal-repo.x86_64
        echo

        echo "Copying the new packages.x86_64 file to the build folder"
        cp -f ../iso/packages.x86_64 $buildFolder/packages.x86_64
        echo

        if [ $personalrepo == true ]; then
                echo "Adding packages from your personal repository - packages-personal-repo.x86_64"
                printf "\n" | sudo tee -a $buildFolder/packages.x86_64
                #cat ../iso/packages-personal-repo.x86_64 | sudo tee -a $buildFolder/packages.x86_64
        fi

        if [ $personalrepo == true ]; then
                echo "Adding our own repo to /etc/pacman.conf"
                printf "\n" | sudo tee -a $buildFolder/pacman.conf
                printf "\n" | sudo tee -a $buildFolder/airootfs/etc/pacman.conf
                cat personal-repo | sudo tee -a $buildFolder/pacman.conf
                cat personal-repo | sudo tee -a $buildFolder/airootfs/etc/pacman.conf
        fi

echo
echo "################################################################## "
tput setaf 2
echo "Phase 5 : "
echo "- Changing all references"
echo "- Adding time to /etc/dev-rel"
tput sgr0
echo "################################################################## "
echo

        #Setting variables

        #profiledef.sh
        #oldname1='iso_name="athenaos"'
        #newname1='iso_name="athenaos"'

        #oldname2='iso_label="ATHENA-OS"'
        #newname2='iso_label="ATHENA-OS"'

        #oldname3='Athena OS'
        #newname3='Athena OS'

        #hostname
        #oldname4='athenaos'
        #newname4='athenaos'

        #sddm.conf user-session
        #oldname5='Session=gnome'
        #newname5='Session='$dmDesktop

        #echo "Changing all references"
        #echo
        #sed -i "s/'$oldname1'/'$newname1'/g" $buildFolder/profiledef.sh
        #sed -i "s/'$oldname2'/'$newname2'/g" $buildFolder/profiledef.sh
        #sed -i "s/'$oldname3'/'$newname3'/g" $buildFolder/airootfs/etc/dev-rel
        #sed -i "s/'$oldname4'/'$newname4'/g" $buildFolder/airootfs/etc/hostname
        #sed -i "s/'$oldname5'/'$newname5'/g" $buildFolder/airootfs/etc/sddm.conf

        echo "Adding time to /etc/dev-rel"
        date_build=$(date -d now)
        echo "Iso build on : "$date_build
        sudo sed -i "s/\(^ISO_BUILD=\).*/\1$date_build/" $buildFolder/airootfs/etc/dev-rel


echo
echo "###########################################################"
tput setaf 2
echo "Phase 6 :"
echo "- Cleaning the cache from /var/cache/pacman/pkg/"
tput sgr0
echo "###########################################################"
echo

        echo "Cleaning the cache from /var/cache/pacman/pkg/"
        yes | sudo pacman -Scc

echo
echo "################################################################## "
tput setaf 2
echo "Phase 7 :"
echo "- Building the iso - this can take a while - be patient"
tput sgr0
echo "################################################################## "
echo

        [ -d $outFolder ] || mkdir $outFolder
        cd $buildFolder/
        sudo mkarchiso -v -w $buildFolder -o $outFolder $buildFolder/



echo
echo "###################################################################"
tput setaf 2
echo "Phase 8 :"
echo "- Creating checksums"
echo "- Copying pkglist"
tput sgr0
echo "###################################################################"
echo
        # Needed to prevent the hash calculation containing the absolute path
        cd $outFolder

        echo "Creating checksums for : "$isoLabel
        echo "##################################################################"
        echo
        echo "Building md5sum"
        echo "########################"
        md5sum $isoLabel | tee $outFolder/$isoLabel.md5
        echo "Building sha1sum"
        echo "########################"
        sha1sum $isoLabel | tee $outFolder/$isoLabel.sha1
        echo "Building sha256sum"
        echo "########################"
        sha256sum $isoLabel | tee $outFolder/$isoLabel.sha256
        echo "Building sha512sum"
        echo "########################"
        sha512sum $isoLabel | tee $outFolder/$isoLabel.sha512
        echo
        echo "Moving pkglist.x86_64.txt"
        echo "########################"
        cp $buildFolder/arch/pkglist.x86_64.txt  $outFolder/$isoLabel".pkglist.txt"

echo
echo "##################################################################"
tput setaf 2
echo "Phase 9 :"
echo "- Making sure we start with a clean slate next time"
tput sgr0
echo "################################################################## "
echo

        echo "Deleting the build folder if one exists - takes some time"
        [ -d $buildFolder ] && sudo rm -rf $buildFolder

echo
echo "##################################################################"
tput setaf 2
echo "DONE"
echo "- Check your out folder :"$outFolder
tput sgr0
echo "################################################################## "
echo
