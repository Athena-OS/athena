{ pkgs, home-manager, username, ... }:
let
  fontList = with pkgs; [
    (nerdfonts.override { fonts = [ "JetBrainsMono" "NerdFontsSymbolsOnly" ]; })
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
  programs.zsh.ohMyZsh.enable = true;
  security.polkit.enable = true;
  services = {
    mpd.enable = true;
    picom.enable = true;
    xserver = {
      enable = true;
      windowManager = {
        bspwm.enable = true;
      };
    };
  };
  environment.pathsToLink = [
    "/share/backgrounds" # TODO: https://github.com/NixOS/nixpkgs/issues/47173
  ];
  environment.systemPackages = bspwm-packages ++ fontList;

  # ---- Home Configuration ----
  home-manager.users.${username} = { pkgs, ...}: {

    programs.eww.enable = true;

    # It copies "./config/menus/gnome-applications.menu" source file to the nix store, and then symlinks it to the location.
    xdg.configFile."bspwm".source = ./config/bspwm;
    xdg.configFile."btop".source = ./config/btop;
    xdg.configFile."mpd".source = ./config/mpd;
    xdg.configFile."ncmpcpp".source = ./config/ncmpcpp;
    xdg.configFile."ranger".source = ./config/ranger;
    xdg.configFile."rofi".source = ./config/rofi;
    home.file.".local/bin/colorscript".source = ./local/bin/colorscript;
    home.file.".local/bin/sysfetch".source = ./local/bin/sysfetch;
    xdg.dataFile."applications/nvim.desktop".source = ./local/share/applications/nvim.desktop;
    xdg.dataFile."applications/ranger.desktop".source = ./local/share/applications/ranger.desktop;
    xdg.dataFile."applications/zfetch.desktop".source = ./local/share/applications/zfetch.desktop;
    xdg.dataFile."asciiart".source = ./local/share/asciiart;
    xdg.dataFile."fonts".source = ./local/share/fonts;
    home.file.".p10k.zsh".source = ./p10k.zsh;

  };
}