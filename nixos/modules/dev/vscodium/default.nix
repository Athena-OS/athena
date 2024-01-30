{ pkgs, nixpkgs, home-manager, username, ... }:
{
  # To run VSCodium in Wayland
  #environment.sessionVariables.NIXOS_OZONE_WL = "1";

  home-manager.users.${username} = { pkgs, ...}: {
    programs.vscode = {
      enable = true;
      package = pkgs.vscodium;
      extensions = with pkgs.vscode-extensions; [
        bbenoist.nix
        pkief.material-icon-theme
      ];
      # In case extensions are not loaded, refer to https://github.com/nix-community/home-manager/issues/3507
      userSettings = {
        "workbench.iconTheme" = "material-icon-theme";
        "window.dialogStyle" = "custom";
        "window.titleBarStyle" = "custom";
        "editor.fontFamily" =  "JetBrains Mono, Consolas, 'Courier New', monospace";
        "editor.fontSize" =  12;
        "editor.fontWeight" =  300;
        "editor.lineHeight" =  20;
        "editor.letterSpacing" =  0.5;
        "editor.fontLigatures" =  true;
        "editor.wordWrap" =  "on";
        "editor.formatOnPaste" =  true;
        "editor.cursorBlinking" =  "smooth";
      };
    };
  };
}
