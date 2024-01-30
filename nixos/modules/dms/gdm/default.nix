{ pkgs, ... }:
{
    services.xserver.displayManager.gdm = {
      enable = true;
      wayland = true;
    };

    # Change GDM Background. Ref: https://gitlab.gnome.org/GNOME/gnome-shell/-/issues/3877
}
