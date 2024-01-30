# This module defines a NixOS installation CD that contains X11 and
# XFCE.

{ pkgs, ... }:
{
  imports = [ ./installation-cd-graphical-base.nix ];

  isoImage.edition = "mate";

  services.xserver = {
    enable = true;
    desktopManager = {
      mate.enable = true;
    };
    displayManager = {
      lightdm.enable = true;
      autoLogin = {
        enable = true;
        user = "athena";
      };
    };
  };
  environment.pathsToLink = [
    "/share/backgrounds" # TODO: https://github.com/NixOS/nixpkgs/issues/47173
  ];
  environment.systemPackages = [
    pkgs.xdg-user-dirs
  ];
}
