{ pkgs, nixpkgs, home-manager, username, theme-components, ... }:
let
  theme-components = {
    gtk-theme = "Sweet-Dark-v40";
    icon-theme = "Sweet-Purple";
    cursor-theme = "oreo_spark_purple_cursors";
    background = "nix-neon-circle.jpg";
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
    (callPackage ../../../pkgs/themes/athena-purple-base/package.nix { })
    candy-icons
  ];
  home-manager.users.${username} = { pkgs, ...}: {
    # Needed to apply the theme on GTK4 windows (like Nautilus)
    home.sessionVariables.GTK_THEME = gtkTheme;
    
    gtk = {
      enable = true;
      gtk3.extraConfig.gtk-decoration-layout = "menu:";
      theme = {
        name = gtkTheme;
        package = pkgs.sweet;
      };
      iconTheme = {
        name = gtkIconTheme;
        package = pkgs.sweet-folders;
      };
      cursorTheme = {
        name = gtkCursorTheme;
        package = pkgs.oreo-cursors-plus;
      };
    };
    programs.kitty = {
      theme = "Adventure Time";
    };
    programs.vscode = {
      extensions = with pkgs.vscode-extensions; [
        dhedgecock.radical-vscode
      ];
      # In case extensions are not loaded, refer to https://github.com/nix-community/home-manager/issues/3507
      userSettings = {
        "workbench.colorTheme" = "Radical";
      };
    };
  };
}
