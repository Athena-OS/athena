# In XFCE module, home.nix is used to set if implementing xfce.refined or xfce.picom
{ home-manager, username, theme, ... }:
{
  # ---- System Configuration ----
  services.xserver = {
    enable = true;
    desktopManager = {
      xfce = {
        enable = true;
        enableScreensaver = false;
      };
    };
  };
  environment.pathsToLink = [
    "/share/backgrounds" # TODO: https://github.com/NixOS/nixpkgs/issues/47173
  ];
  programs.xfconf.enable = true;
  environment.systemPackages = with pkgs.xfce; [
    xfce4-cpugraph-plugin
    xfce4-docklike-plugin
    xfce4-genmon-plugin
    xfce4-pulseaudio-plugin
    xfce4-settings
    xfce4-whiskermenu-plugin
  ];

  # ---- Home Configuration ----
  home-manager.users.${username} = { pkgs, ...}: {
        imports = [
          ./xfce.nix
        ];
    _module.args.theme = theme;
    athena.desktops.xfce.refined = true;
  };
}
