{ pkgs, ... }:
{
  services.xserver.displayManager.lightdm = {
    enable = true;
    greeters.slick.enable = true;
  };
}
