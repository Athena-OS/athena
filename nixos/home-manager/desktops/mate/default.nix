{ pkgs, home-manager, username, terminal ? "alacritty", theme-components, ... }:
let
  mate-packages = with pkgs.mate; [
    caja-with-extensions
    eom
    marco
    mate-control-center
    mate-desktop
    mate-media
    mate-netbook
    mate-panel
    mate-polkit
    mate-power-manager
    mate-session-manager
    mate-tweak
    mate-utils
  ];
  fontList = with pkgs; [
    (nerdfonts.override { fonts = [ "JetBrainsMono" "NerdFontsSymbolsOnly" ]; })
  ];
  gtkTheme = "${theme-components.gtk-theme}";
  gtkIconTheme = "${theme-components.icon-theme}";
  gtkCursorTheme = "${theme-components.cursor-theme}";
  backgroundTheme = "${theme-components.background}";
in
{
  # ---- System Configuration ----
  services.xserver = {
    enable = true;
    desktopManager = {
      mate.enable = true;
    };
  };
  environment.pathsToLink = [
    "/share/backgrounds" # TODO: https://github.com/NixOS/nixpkgs/issues/47173
  ];
  environment.systemPackages = mate-packages ++ [
    pkgs.xdg-user-dirs
  ];

  # ---- Home Configuration ----
  home-manager.users.${username} = { pkgs, ...}: {
    home.packages = fontList;

    xdg.mimeApps = {
      enable = true;
      defaultApplications = {
        "inode/directory" = ["caja.desktop"];
      };
    };

    dconf.settings = {
        "org/mate/desktop/interface" = {
            "gtk-theme" = gtkTheme;
        };
        "org/mate/marco/general" = {
            "theme" = gtkTheme;
        };
        "org/mate/desktop/interface" = {
            "icon-theme" = gtkIconTheme;
        };
        "org/mate/desktop/peripherals/mouse" = {
            "cursor-theme" = gtkCursorTheme;
        };
        "org/mate/desktop/background" = {
            "picture-filename" = "/run/current-system/sw/share/backgrounds/athena/"+backgroundTheme;
        };
    };

    # It copies "./config/menus/gnome-applications.menu" source file to the nix store, and then symlinks it to the location.
    xdg.configFile."menus/applications-merged/mate-applications.menu".source = ./config/menus/applications-merged/mate-applications.menu;

    dconf.settings = {

      "org/gnome/shell".favorite-apps = [ "kali-mimikatz.desktop" "kali-powersploit.desktop" "seclists.desktop" "payloadsallthethings.desktop" "shell.desktop" "powershell.desktop" "cyberchef.desktop" "fuzzdb.desktop" "securitywordlist.desktop" "autowordlists.desktop" ];

      # /desktop/applications/terminal
      "org/gnome/desktop/applications/terminal" = {
        exec = "${terminal}";
      };

      # /panel
      "org/mate/panel/general" = {
        object-id-list = [ "menu-bar" "notification-area" "clock" "show-desktop" "window-list" "workspace-switcher" "object-0" "object-1" "object-2" "object-3" "object-4" "object-5"];
        toplevel-id-list = ["top" "bottom"];
      };
      "org/mate/panel/objects/clock" = {
        applet-iid = "ClockAppletFactory::ClockApplet";
        locked = true;
        object-type = "applet";
        panel-right-stick = true;
        position = 0;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/clock/prefs" = {
        format = "24-hour";
      };
      "org/mate/panel/objects/menu-bar" = {
        locked = true;
        object-type = "menu-bar";
        position = 0;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/notification-area" = {
        applet-iid = "NotificationAreaAppletFactory::NotificationArea";
        locked = true;
        object-type = "applet";
        panel-right-stick = true;
        position = 10;
        toplevel-id = "top";
      };
      #"org/mate/panel/objects/object-0" = {
      #  launcher-location = "/run/current-system/sw/share/applications/cyberchef.desktop";
      #  object-type = "launcher";
      #  panel-right-stick = false;
      #  position = -1;
      #  toplevel-id = "top";
      #};
      #"org/mate/panel/objects/object-1" = {
      #  launcher-location = "/run/current-system/sw/share/applications/org.athenaos.CyberHub.desktop";
      #  object-type = "launcher";
      #  panel-right-stick = false;
      #  position = -1;
      #  toplevel-id = "top";
      #};
      "org/mate/panel/objects/object-0" = {
        launcher-location = "${pkgs.firefox}/share/applications/firefox.desktop";
        object-type = "launcher";
        panel-right-stick = false;
        position = -1;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/object-1" = {
        launcher-location = "/run/current-system/sw/share/applications/shell.desktop";
        object-type = "launcher";
        panel-right-stick = false;
        position = -1;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/object-2" = {
        launcher-location = "/run/current-system/sw/share/applications/powershell.desktop";
        object-type = "launcher";
        panel-right-stick = false;
        position = -1;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/object-3" = {
        launcher-location = "/run/current-system/sw/share/applications/payloadsallthethings.desktop";
        object-type = "launcher";
        panel-right-stick = false;
        position = -1;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/object-4" = {
        launcher-location = "/run/current-system/sw/share/applications/seclists.desktop";
        object-type = "launcher";
        panel-right-stick = false;
        position = -1;
        toplevel-id = "top";
      };
      "org/mate/panel/objects/show-desktop" = {
        applet-iid = "WnckletFactory::ShowDesktopApplet";
        locked = true;
        object-type = "applet";
        position = 0;
        toplevel-id = "bottom";
      };
      "org/mate/panel/objects/window-list" = {
        applet-iid = "WnckletFactory::WindowListApplet";
        locked = true;
        object-type = "applet";
        position = 20;
        toplevel-id = "bottom";
      };
      "org/mate/panel/objects/workspace-switcher" = {
        applet-iid = "WnckletFactory::WorkspaceSwitcherApplet";
        locked = true;
        object-type = "applet";
        panel-right-stick = true;
        position = 0;
        toplevel-id = "bottom";
      };
      "org/mate/panel/toplevels/bottom" = {
        expand = true;
        orientation = "bottom";
        screen = 0;
        size = 24;
        y = 854;
        y-bottom = 0;
      };
      "org/mate/panel/toplevels/top" = {
        expand = true;
        orientation = "top";
        screen = 0;
        size = 38;
      };
    };
  };
}
