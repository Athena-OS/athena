#!/bin/bash

#============================================================
# Authors: Brad Heffernan - Erik Dubois - Cameron Percival
#============================================================

DESKTOP="UNKNOWN"

function detect_awesome()
{
    ps -e | grep -E '^.* awesome$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`awesome --version | head -1 | awk '{print $2}'`
    DESKTOP="AWESOME"
    return 1
}

function detect_bspwm()
{
    ps -e | grep -E '^.* bspwm$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`bspwm -v | awk '{print $1}'`
    DESKTOP="BSPWM"
    return 1
}

function detect_budgie()
{
    ps -e | grep -E '^.* budgie-wm$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`budgie-desktop --version | head -1 | awk '{print $2}'`
    DESKTOP="BUDGIE-DESKTOP"
    return 1
}

function detect_cinnamon()
{
    ps -e | grep -E '^.* cinnamon$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`cinnamon --version | awk '{print $2}'`
    DESKTOP="CINNAMON"
    return 1
}

function detect_deepin()
{
    ps -e | grep -E '^.* deepin$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`deepin --version | awk '{print $2}'`
    DESKTOP="DEEPIN"
    return 1
}

function detect_gnome()
{
    ps -e | grep -E '^.* gnome-shell$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`gnome-shell --version | awk '{print $3}'`
    DESKTOP="GNOME"
    return 1
}

function detect_hlwm()
{
    ps -e | grep -E '^.* herbstluftwm$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`herbstluftwm --version |  head -1 | awk '{print $2}'`
    DESKTOP="HERBSTLUFTWM"
    return 1
}

function detect_i3wm()
{
    ps -e | grep -E '^.* i3$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`i3 --version | awk '{print $3}'`
    DESKTOP="I3"
    return 1
}

function detect_lxde()
{
    ps -e | grep -E '^.* lxsession$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi

    # We can detect LXDE version only thru package manager
    which apt-cache > /dev/null 2> /dev/null
    if [ $? -ne 0 ];
    then
	which yum > /dev/null 2> /dev/null
	if [ $? -ne 0 ];
	then
	    VERSION='UNKNOWN'
	else
	    # For Fedora
	    VERSION=`yum list lxde-common | grep lxde-common | awk '{print $2}' | awk -F '-' '{print $1}'`
	fi
    else
	# For Lubuntu and Knoppix
	VERSION=`apt-cache show lxde-common /| grep 'Version:' | awk '{print $2}' | awk -F '-' '{print $1}'`
    fi
    DESKTOP="LXDE"
    return 1
}

function detect_lxqt()
{
    ps -e | grep -E '^.* lxqt-session$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`lxqt-about --version | head -1 | awk '{print $2}'`
    DESKTOP="LXQT"
    return 1
}

function detect_mate()
{
    ps -e | grep -E '^.* mate-panel$' > /dev/null
    if [ $? -ne 0 ];
    then
	     return 0
    fi
    VERSION=`mate-about --version | awk '{print $4}'`
    DESKTOP="MATE"
    return 1
}

function detect_openbox()
{
    ps -e | grep -E '^.* openbox$' > /dev/null
    if [ $? -ne 0 ];
    then
	     return 0
    fi
    VERSION=`openbox --version | head -1 | awk '{print $2}'`
    DESKTOP="OPENBOX"
    return 1
}

function detect_plasma()
{
    ps -e | grep -E '^.* plasmashell$' > /dev/null
    if [ $? -ne 0 ];
    then
        return 0
    else
        VERSION=`plasmashell --version | awk '{print $2}'`
        DESKTOP="PLASMA"
        return 1
    fi
}

function detect_qtile()
{
    ps -e | grep -E '^.* qtile$' > /dev/null
    if [ $? -ne 0 ];
    then
	     return 0
    fi
    VERSION=`qtile --version | awk '{print $1}'`
    DESKTOP="QTILE"
    return 1
}

function detect_xfce()
{
    ps -e | grep -E '^.* xfce4-session$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`xfce4-session --version | grep xfce4-session | awk '{print $2}'`
    DESKTOP="XFCE"
    return 1
}

function detect_xmonad()
{
    ps -e | grep -E '^.* xmonad-x86_64-l$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`xmonad --version | awk '{print $2}'`
    DESKTOP="XMONAD"
    return 1
}

function detect_jwm()
{
    ps -e | grep -E '^.* jwm$' > /dev/null
    if [ $? -ne 0 ];
    then
	return 0
    fi
    VERSION=`jwm -v | grep JWM | awk '{print $2}'`
    DESKTOP="JWM"
    return 1
}


detect_awesome;
detect_bspwm;
detect_budgie;
detect_cinnamon;
detect_deepin;
detect_gnome;
detect_hlwm;
detect_i3wm;
detect_jwm;
detect_mate;
detect_openbox;
#needs to be here because of lxqt and openbox
detect_lxde;
detect_lxqt;
detect_plasma;
detect_qtile;
detect_xfce;
detect_xmonad;

# if detect_unity;
# then
#     if detect_kde;
#     then
# 	if detect_gnome;
# 	then
# 	    if detect_xfce;
# 	    then
# 		if detect_cinnamon;
# 		then
# 		    if detect_mate;
# 		    then
# 			if detect_lxde;
# 			then
# 			    detect_sugar
# 			fi
# 		    fi
# 		fi
# 	    fi
# 	fi
#     fi
# fi


if [ "$1" == '-v' ];
then
    echo $VERSION
else
    if [ "$1" == '-n' ];
    then
	echo $DESKTOP
    else
	echo $DESKTOP $VERSION
    fi
fi
