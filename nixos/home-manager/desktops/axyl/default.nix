{ pkgs, home-manager, username, ... }:
let
  fontList = with pkgs; [
    noto-fonts-emoji
    dejavu_fonts
    liberation_ttf
    source-code-pro
    inter
    (nerdfonts.override { fonts = [ "JetBrainsMono" "NerdFontsSymbolsOnly" "Iosevka" ]; })
  ];
  bspwm-packages = with pkgs; [
    alacritty
    bat
    bluez
    bluez-tools
    brightnessctl
    btop
    dunst
    feh
    ffcast
    ffmpegthumbnailer
    geany
    glfw-wayland
    gnome.libgnome-keyring
    i3lock-color
    imagemagick
    jq
    libwebp
    lsd
    maim
    mlocate
    mpc-cli
    ncmpcpp
    nettools
    openvpn
    pamixer
    papirus-icon-theme
    pavucontrol
    physlock
    playerctl
    polkit_gnome
    polybar
    powerline
    libsForQt5.qt5.qtgraphicaleffects
    libsForQt5.qt5.qtquickcontrols2
    libsForQt5.qt5.qtsvg
    libsForQt5.qt5.qtwayland
    ranger
    rofi
    scrot
    sxhkd
    tdrop
    ueberzug
    vim
    vimPlugins.vim-airline
    vimPlugins.vim-airline-themes
    vimPlugins.Vundle-vim
    webp-pixbuf-loader
    xclip
    xdg-user-dirs
    xdotool
    xorg.xinit
    xorg.xkill
    xorg.xlsclients
    xorg.xprop
    xorg.xrandr
    xorg.xsetroot
    xorg.xwininfo
    xwayland
    zoxide
    zsh-powerlevel10k
  ];
in
{
  # ---- System Configuration ----
  environment.systemPackages = bspwm-packages ++ fontList;
  services.xserver = {
    enable = true;
    windowManager = {
      bspwm.enable = true;
    };
  };
  services.picom = {
    enable = true;
    settings = import ./picom.nix;
  };

  # ---- Home Configuration ----
  home-manager.users.${username} = { pkgs, ...}: {
    programs.alacritty = {
        enable = true;
        settings = import ./alacritty.nix;
    };

    services.dunst = {
        enable = true;
        settings = import ./dunst.nix;
    };

    services.polybar = {
        enable = true;
        script = "";
    };

    services.sxhkd = {
      enable = true;
      keybindings = import ./sxhkd.nix;
    };

    programs.eww.enable = false;

    # It copies "./config/menus/gnome-applications.menu" source file to the nix store, and then symlinks it to the location.
    xdg.configFile."bspwm/bspwmrc".source = ./bspwmrc;
    xdg.configFile."bspwm/.fehbg".source = ./.fehbg;
    xdg.configFile."bspwm/wallpaper.jpg".source = ./wallpaper.jpg;
    xdg.configFile."bspwm/polybar/colors".source = ./polybar/colors;
    xdg.configFile."bspwm/polybar/config".source = ./polybar/config;
    xdg.configFile."bspwm/polybar/decor".source = ./polybar/decor;
    xdg.configFile."bspwm/polybar/modules".source = ./polybar/modules;
    xdg.configFile."bspwm/polybar/system".source = ./polybar/system;
    xdg.configFile."bspwm/polybar/launch.sh".source = ./polybar/launch.sh;
    xdg.configFile."bspwm/scripts".source = ./scripts;
    xdg.configFile."bspwm/assets".source = ./assets;
    xdg.configFile."rofi".source = ./rofi;
    
  };
}
