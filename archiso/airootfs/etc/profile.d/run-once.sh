#!/bin/sh

FLAGFILE="$HOME/flag-work-once"

if [ -f "$FLAGFILE" ]; then
    rm -rf "$FLAGFILE"
        
    wget https://github.com/Schneegans/Fly-Pie/releases/latest/download/flypie@schneegans.github.com.zip
    gnome-extensions install flypie@schneegans.github.com.zip
    gnome-extensions enable flypie@schneegans.github.com

    wget https://github.com/Schneegans/Burn-My-Windows/releases/latest/download/burn-my-windows@schneegans.github.com.zip
    gnome-extensions install burn-my-windows@schneegans.github.com.zip
    gnome-extensions enable burn-my-windows@schneegans.github.com

    wget https://extensions.gnome.org/extension-data/appindicatorsupportrgcjonas.gmail.com.v42.shell-extension.zip  
    gnome-extensions install appindicatorsupportrgcjonas.gmail.com.v42.shell-extension.zip
    gnome-extensions enable appindicatorsupport@rgcjonas.gmail.com
    
    git clone https://github.com/micheleg/dash-to-dock.git -b ubuntu-dock
    make -C dash-to-dock install
    
    wget https://extensions.gnome.org/extension-data/dingrastersoft.com.v46.shell-extension.zip
    gnome-extensions install dingrastersoft.com.v46.shell-extension.zip
    gnome-extensions enable ding@rastersoft.com    

    cat $HOME/dconf-interface.ini | dconf load /org/gnome/desktop/interface/
    cat $HOME/dconf-login-screen.ini | dconf load /io/github/realmazharhussain/GdmSettings/appearance/
    cat $HOME/dconf-screensaver.ini | dconf load /org/gnome/desktop/screensaver/
    cat $HOME/dconf-preferences.ini | dconf load /org/gnome/desktop/wm/preferences/
    cat $HOME/dconf-shell.ini | dconf load /org/gnome/shell/
        
    sh ~/.vim_runtime/install_awesome_parameterized.sh ~/.vim_runtime $USER
    
    package=athena-sweet-dark-theme
    if pacman -Qq $package > /dev/null ; then
       gsettings set org.gnome.desktop.interface color-scheme prefer-dark
       gsettings set org.gnome.desktop.interface gtk-theme Sweet-Dark
       gsettings set org.gnome.desktop.wm.preferences theme Sweet-Dark
       gsettings set org.gnome.desktop.interface icon-theme Sweet-Purple
       gsettings set org.gnome.desktop.background picture-uri-dark file:///usr/share/backgrounds/default/neon_circle.jpg
       gsettings set org.gnome.desktop.background picture-uri file:///usr/share/backgrounds/default/neon_circle.jpg
       gsettings set org.gnome.desktop.background picture-options stretched
    fi

    package=athena-graphite-theme
    if pacman -Qq $package > /dev/null ; then
       gsettings set org.gnome.desktop.interface color-scheme prefer-dark
       gsettings set org.gnome.desktop.interface gtk-theme Graphite-Dark-compact
       gsettings set org.gnome.desktop.wm.preferences theme Graphite-Dark-compact
       gsettings set org.gnome.desktop.interface icon-theme Tela-circle-black-dark
       gsettings set org.gnome.desktop.background picture-uri-dark file:///usr/share/backgrounds/default/arch-ascii.png
       gsettings set org.gnome.desktop.background picture-uri file:///usr/share/backgrounds/default/arch-ascii.png
       gsettings set org.gnome.desktop.background picture-options stretched
    fi

    rm -rf $HOME/flypie@schneegans.github.com.zip $HOME/dash-to-dock $HOME/dingrastersoft.com.v46.shell-extension.zip $HOME/burn-my-windows@schneegans.github.com.zip $HOME/appindicatorsupportrgcjonas.gmail.com.v42.shell-extension.zip
    rm -rf $HOME/dconf-interface.ini $HOME/dconf-login-screen.ini $HOME/dconf-screensaver.ini $HOME/dconf-preferences.ini $HOME/dconf-shell.ini
fi

#If tun0 is down (i.e., after a reboot), the shell prompt must be updated with the running interfaces
if ! nmcli c show --active | grep -q tun ; then

   prompt-reset
  
fi

/usr/local/bin/htb-update

export SHELL=$(which fish)
