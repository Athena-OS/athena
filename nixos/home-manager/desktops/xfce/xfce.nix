{ config, lib, pkgs, theme, ... }:
with lib;
let
  cfg = config.athena.desktops.xfce;
  bg-path = "/run/current-system/sw/share/backgrounds/athena/${theme.background}";
  # pkgs.writeShellScriptBin and builtins.readFile are used to take the specified shell script that can be called and installed below by home-manager. There is no a target dir because home-manager will make them inside $PATH in order to be called
  genmon-cpu = pkgs.writeShellScriptBin "genmon-cpu"
    (builtins.readFile ./bin/genmon-cpu);
  genmon-datetime = pkgs.writeShellScriptBin "genmon-datetime"
    (builtins.readFile ./bin/genmon-datetime);
  genmon-mem = pkgs.writeShellScriptBin "genmon-mem"
    (builtins.readFile ./bin/genmon-mem);
  i3lock-everblush = pkgs.writeShellScriptBin "i3lock-everblush"
    (builtins.readFile ./bin/i3lock-everblush);
  #xfce-init = pkgs.writeShellScriptBin "xfce-init"
    #(builtins.readFile ./bin/xfce-init);
in
{
  options.athena.desktops.xfce = {
    refined = mkEnableOption (mdDoc "Whether to enable AthenaOS's XFCE Refined desktop");
    picom = mkEnableOption (mdDoc "Whether to enable AthenaOS's XFCE Picom desktop");
  };

  config = mkIf (cfg != null) (mkMerge [
    {
      home.packages = with pkgs; [
        (nerdfonts.override { fonts = [ "JetBrainsMono" "NerdFontsSymbolsOnly" ]; })
        #mugshot
        networkmanagerapplet # NetworkManager control applet for GNOME
        xdg-user-dirs # A tool to help manage well known user directories like the desktop folder and the music folder
        xorg.xrandr
      ] ++ (with pkgs.xfce; [
        ristretto # A fast and lightweight picture-viewer for the Xfce desktop environment
        xfce4-appfinder # Appfinder for the Xfce4 Desktop Environment
        #xfce4-cpugraph-plugin # CPU graph show for Xfce panel
        xfce4-panel # Panel for the Xfce desktop environment
        xfce4-power-manager # A power manager for the Xfce Desktop Environment
        #xfce4-pulseaudio-plugin # Adjust the audio volume of the PulseAudio sound system
        xfce4-screenshooter # Screenshot utility for the Xfce desktop
        xfce4-session # Session manager for Xfce
        #xfce4-settings # Settings manager for Xfce
        xfce4-taskmanager # Easy to use task manager for Xfce
        #xfce4-whiskermenu-plugin # Alternate application launcher for Xfce
        xfdesktop # Xfce's desktop manager
        xfwm4 # Window manager for Xfce
      ]);

      home.sessionVariables = { QT_AUTO_SCREEN_SCALE_FACTOR = 0; };

      qt.style.name = "qt5ct";
      
      #xdg.desktopEntries."xfce-init" = {
      #  name = "XFCE Initialization";
      #  exec = "xfce-init";
      #  categories = [ "Application" ];
      #  noDisplay = true;
      #};

      # To understand about env variables of xdg, refer to https://github.com/nix-community/home-manager/blob/master/modules/misc/xdg.nix
      # xdg.systemDirs.config is used to source /etc/xdg AND ${config.xdg.configHome}/xfce4/xdg, like a $PATH. In practice, the specified dirs are added in $XDG_CONFIG_DIRS
      xdg.systemDirs.config = [ "/etc/xdg" "${config.xdg.configHome}/xfce4/xdg" ]; # Not working?

      # It copies "./config/menus/xfce-applications.menu" source file to the nix store, and then symlinks it to the location.
      xdg.configFile."menus/xfce-applications.menu".source = ./config/menus/xfce-applications.menu;

      # Everblush xfwm4 theme
      # home.file refers to $HOME dir
      home.file.".themes".source = ./themes;

      /*home.activation.flag-xfce-once = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
        touch ${config.home.homeDirectory}/.flag-xfce-once
      '';*/

      # IMPORTANT: if a specified xfconf setting doesn't work, check if there is an hardcoded xfconf setting inside $HOME/xfce4/xfconf/xfce4-perchannel/<filename>.xml dir and delete the entry in your the .xml file of your flake repository
      xfconf.settings = {
        xsettings = {
          "Net/ThemeName" = "${theme.gtk-theme}";
          "Net/IconThemeName" = "${theme.icon-theme}";
          "Gtk/CursorThemeName" = "${theme.cursor-theme}";
        };
        xfce4-desktop = {
          "backdrop/screen0/monitor0/workspace0/last-image" = "${bg-path}";
          "backdrop/screen0/monitor0/workspace1/last-image" = "${bg-path}";
          "backdrop/screen0/monitor0/workspace2/last-image" = "${bg-path}";
          "backdrop/screen0/monitor0/workspace3/last-image" = "${bg-path}";
          "backdrop/screen0/monitorLVDS-1/workspace0/last-image" = "${bg-path}";
          "backdrop/screen0/monitorLVDS-1/workspace1/last-image" = "${bg-path}";
          "backdrop/screen0/monitorLVDS-1/workspace2/last-image" = "${bg-path}";
          "backdrop/screen0/monitorLVDS-1/workspace3/last-image" = "${bg-path}";
          "backdrop/screen0/monitorHDMI-1/workspace0/last-image" = "${bg-path}";
          "backdrop/screen0/monitorHDMI-1/workspace1/last-image" = "${bg-path}";
          "backdrop/screen0/monitorHDMI-1/workspace2/last-image" = "${bg-path}";
          "backdrop/screen0/monitorHDMI-1/workspace3/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVGA-1-2/workspace0/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVGA-1-2/workspace1/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVGA-1-2/workspace2/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVGA-1-2/workspace3/last-image" = "${bg-path}";
          "backdrop/screen0/monitoreDP-1/workspace0/last-image" = "${bg-path}";
          "backdrop/screen0/monitoreDP-1/workspace1/last-image" = "${bg-path}";
          "backdrop/screen0/monitoreDP-1/workspace2/last-image" = "${bg-path}";
          "backdrop/screen0/monitoreDP-1/workspace3/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVirtual1/workspace0/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVirtual1/workspace1/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVirtual1/workspace2/last-image" = "${bg-path}";
          "backdrop/screen0/monitorVirtual1/workspace3/last-image" = "${bg-path}";
        };
      };
    }

    (mkIf cfg.refined rec {
      # If xfce refined is enabled
      home.packages = with pkgs; [
        gnome.nautilus  
      ];
      xdg.configFile."xfce4" = {
        source = ./config/xfce4-refined;
        #recursive = true;
      };
      xfconf.settings = {
        xfwm4 = {
          "general/workspace_names" = ["🕵️  " "📖  " "🍒  " "🎸  " "🎮  " "🐝  "];
        };
      };
    })

    (mkIf cfg.picom {
      # If xfce picom is enabled
      home.packages = with pkgs; [
        #xfce.xfce4-docklike-plugin
        findex # Highly customizable application finder written in Rust and uses Gtk3
        i3lock-color # A simple screen locker like slock, enhanced version with extra configuration options
        picom # A fork of XCompMgr, a sample compositing manager for X servers
        qt6Packages.qtstyleplugin-kvantum # SVG-based Qt theme engine plus a config tool and extra themes
        roboto # The Roboto family of fonts
        roboto-mono # Google Roboto Mono fonts
      ] ++ (with pkgs.xfce; [
        thunar # Xfce file manager
      ]) ++ [
        genmon-cpu
        genmon-datetime
        genmon-mem
        i3lock-everblush
        #xfce-init
      ];
      
      # IMPORTANT: if a specified xfconf setting doesn't work, check if there is an hardcoded xfconf setting inside $HOME/xfce4 dir and delete it
      xfconf.settings = {
        xfwm4 = {
          "general/theme" = "everblush";
        };
      };
      # If picom is enabled
      programs.eww.enable = true;
      programs.eww.configDir = ./config/eww;
      systemd.user.services.picom = {
        Unit = {
          Description = "Picom X11 compositor";
          After = [ "graphical-session-pre.target" ];
          PartOf = [ "graphical-session.target" ];
        };

        Install = { WantedBy = [ "graphical-session.target" ]; };

        Service = {
          ExecStart = "${getExe pkgs.picom} --config ${config.xdg.configFile."picom/picom.conf".source}";
          Restart = "always";
          RestartSec = 3;
        };
      };
      # xdg.dataFile refers to .local/share dir
      xdg.dataFile."icons/assets".source = ./assets;
      xdg.dataFile."fonts/feather.ttf".source = ./fonts/feather.ttf;

      # Kvantum Everblush
      xdg.configFile."Kvantum".source = ./config/Kvantum;
      xdg.configFile."gtk-3.0/gtk.css".source = ./config/gtk-3.0/gtk.css;
      xdg.configFile."xfce4".source = ./config/xfce4-picom;
      xdg.desktopEntries."Findex" = {
        name = "Findex";
        comment = "Highly customizable application finder written in Rust and uses Gtk3";
        exec = "findex";
        terminal = false;
        categories = [ "Application" ];
      };

      xresources.properties = {
        # Thanks to https://github.com/Everblush
        "*background" = "#181f21";
        "*foreground" = "#dadada";
        # Black + DarkGrey
        "*color0" = "#22292b";
        "*color8" = "#3b4244";
        # DarkRed + Red
        "*color1" = "#e06e6e";
        "*color9" = "#ef7d7d";
        # DarkGreen + Green
        "*color2" = "#8ccf7e";
        "*color10" = "#9bdead";
        # DarkYellow + Yellow
        "*color3" = "#e5c76b";
        "*color11" = "#f4d67a";
        # DarkBlue + Blue
        "*color4" = "#67b0e8";
        "*color12" = "#6cb5ed";
        # DarkMagenta + Magenta
        "*color5" = "#c47fd5";
        "*color13" = "#ce89df";
        # DarkCyan + Cyan
        "*color6" = "#6da4cd";
        "*color14" = "#67cbe7";
        # LightGrey + White
        "*color7" = "#b3b9b8";
        "*color15" = "#bdc3c2";
      };
    })
  ]);
}
