{ pkgs, nixpkgs, home-manager, username, ... }:
{
  home-manager.users.${username} = {pkgs, ...}: {
    services.dunst = {
      enable = true;
      settings = {
        global = {
          background = "#285577";
          timeout = 20;
          width = "(300, 600)";
          height = 500;
          origin = "top-center";
          notification_limit = 0;
          font = "Monospace 12";
          format = "<b>%s</b>\\n%b";
          corner_radius = 20;
          force_xwayland = true;
          mouse_left_click = "open_url, close_current";
          mouse_middle_click = "close_current";
          default_icon = "./icons/cve.png";
        };
      };
    };
  };
}

