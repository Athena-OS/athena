{ pkgs, nixpkgs, home-manager, username, theme-components, ... }:
let
  theme-components = {
    gtk-theme = "Nightfox-Dusk-B";
    icon-theme = "Material-Black-Cherry-Suru";
    cursor-theme = "Afterglow-Recolored-Dracula-Red";
    background = "redmoon.png";
  };
  gtkTheme = "${theme-components.gtk-theme}";
  gtkIconTheme = "${theme-components.icon-theme}";
  gtkCursorTheme = "${theme-components.cursor-theme}";
  backgroundTheme = "${theme-components.background}";
in
{
  imports =
    [
      {
        _module.args.theme-components = theme-components;
      }
    ];
  environment.systemPackages = with pkgs; [
    (callPackage ../../../pkgs/themes/athena-red-base/package.nix { })
  ];
  home-manager.users.${username} = { pkgs, ...}: {
    # Needed to apply the theme on GTK4 windows (like Nautilus)
    home.sessionVariables.GTK_THEME = gtkTheme;
    
    gtk = {
      enable = true;
      gtk3.extraConfig.gtk-decoration-layout = "menu:";
      theme = {
        name = gtkTheme;
        package = pkgs.nightfox-gtk-theme;
      };
      iconTheme = {
        name = gtkIconTheme;
        package = pkgs.material-black-colors.override {
          colorVariants = [ "Material-Black-Cherry-Suru" ];
        };
      };
      cursorTheme = {
        name = gtkCursorTheme;
        package = pkgs.afterglow-cursors-recolored.override {
          themeVariants = [ "Dracula" ];
          draculaColorVariants = [ "Red" ];
        };
      };
    };
    programs.kitty = {
      theme = "Crayon Pony Fish";
    };
    programs.vscode = {
      extensions = with pkgs.vscode-extensions; [
        dracula-theme.theme-dracula
      ];
      # In case extensions are not loaded, refer to https://github.com/nix-community/home-manager/issues/3507
      userSettings = {
        "workbench.colorTheme" = "Dracula";
      };
    };
  };
}