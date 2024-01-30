{ pkgs, home-manager, username, ... }:
let
  fontList = with pkgs; [
    (nerdfonts.override { fonts = [ "JetBrainsMono" "NerdFontsSymbolsOnly" "FiraCode" "Hack" ]; })
  ];
  bspwm-packages = with pkgs; [
     pfetch
     feh
     sxiv
     picom-next
     bspwm
     sxhkd
     polybar
     rofi
     pipes
     ranger
     pavucontrol
     maim
     killall
     mumble
     xclip
     ffmpeg
     mpv
     gimp
     lxappearance
  ];
in
{
  # ---- System Configuration ----
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
    programs.alacritty = {
        enable = true;
        settings = import ./alacritty;
    };

    # It copies "./config/menus/gnome-applications.menu" source file to the nix store, and then symlinks it to the location.
    #xdg.configFile."alacritty".source = ./alacritty;
    xdg.configFile."bspwm".source = ./bspwm;
    xdg.configFile."picom".source = ./picom;
    xdg.configFile."polybar".source = ./polybar;
    xdg.configFile."ranger".source = ./ranger;
    xdg.configFile."rofi".source = ./rofi;
    xdg.configFile."sxhkd".source = ./sxhkd;

  };
}