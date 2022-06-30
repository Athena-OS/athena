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

    cat $HOME/dconf-interface.ini | dconf load /org/gnome/desktop/interface/
    cat $HOME/dconf-login-screen.ini | dconf load /io/github/realmazharhussain/GdmSettings/appearance/
    cat $HOME/dconf-background.ini | dconf load /org/gnome/desktop/background/
    cat $HOME/dconf-screensaver.ini | dconf load /org/gnome/desktop/screensaver/
    cat $HOME/dconf-preferences.ini | dconf load /org/gnome/desktop/wm/preferences/
    cat $HOME/dconf-shell.ini | dconf load /org/gnome/shell/
    
    sh ~/.vim_runtime/install_awesome_parameterized.sh ~/.vim_runtime $USER
    
    rm -rf $HOME/flypie@schneegans.github.com.zip $HOME/burn-my-windows@schneegans.github.com.zip $HOME/appindicatorsupportrgcjonas.gmail.com.v42.shell-extension.zip
    rm -rf $HOME/dconf-interface.ini $HOME/dconf-login-screen.ini $HOME/dconf-background.ini $HOME/dconf-screensaver.ini $HOME/dconf-preferences.ini $HOME/dconf-shell.ini
fi

export SHELL=$(which fish)
