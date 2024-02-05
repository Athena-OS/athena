{ config, options, pkgs, lib, home-manager, username, terminal ? "alacritty", browser, shell ? "bash", ... }:
with lib;
let
  cfg = config.system.nixos;
  opt = options.system.nixos;
  needsEscaping = s: null != builtins.match "[a-zA-Z0-9]+" s;
  escapeIfNecessary = s: if needsEscaping s then s else ''"${lib.escape [ "\$" "\"" "\\" "\`" ] s}"'';
  attrsToText = attrs:
    concatStringsSep "\n" (
      mapAttrsToList (n: v: ''${n}=${escapeIfNecessary (toString v)}'') attrs
    ) + "\n";

  osReleaseContents = {
    NAME = "${cfg.distroName}";
    ID = "${cfg.distroId}";
    VERSION = "${cfg.release} (${cfg.codeName})";
    VERSION_CODENAME = toLower cfg.codeName;
    VERSION_ID = cfg.release;
    BUILD_ID = cfg.version;
    PRETTY_NAME = "${cfg.distroName} ${cfg.release} (${cfg.codeName})";
    LOGO = "nix-snowflake";
    HOME_URL = lib.optionalString (cfg.distroId == "athena") "https://athenaos.org/";
    DOCUMENTATION_URL = lib.optionalString (cfg.distroId == "athena") "https://athenaos.org/en/getting-started/athenaos/";
    SUPPORT_URL = lib.optionalString (cfg.distroId == "athena") "https://athenaos.org/en/community/getting-help/";
    BUG_REPORT_URL = lib.optionalString (cfg.distroId == "athena") "https://github.com/Athena-OS/athena-nix/issues";
  } // lib.optionalAttrs (cfg.variant_id != null) {
    VARIANT_ID = cfg.variant_id;
  };
  shellrocket = pkgs.writeShellScriptBin "shell-rocket" ''
    TERMINAL_EXEC="$TERMINAL -e"
    
    # Set fallback terminal if needed
    if [[ "$TERMINAL_EXEC" =~ "terminator" ]] || [[ "$TERMINAL_EXEC" =~ "terminology" ]] || [[ "$TERMINAL_EXEC" =~ "xfce4-terminal" ]]; then
      TERMINAL_EXEC="$TERMINAL -e"
    fi
    
    if [[ -n "$NO_REPETITION" ]]; then
      "$@"
    else
      NO_REPETITION=1 $TERMINAL_EXEC ${lib.getExe pkgs.bash} -c "$@"
    fi
  '';
  
in
{
  imports = [
    ./locale
  ];

  environment.systemPackages = [
    shellrocket
  ];

  programs = {
    git.enable = true;
    nano.enable = true;
    ssh.askPassword = ""; # Preventing OpenSSH popup during 'git push'
  };

  #It is needed to enable the used shell also at system level because NixOS cannot see home-manager modules. Note: bash does not need to be enabled
  programs.${shell} = mkIf ("${shell}" != "bash") {
    enable = true;
  };

  home-manager.users.${username} = { pkgs, ... }: {
    /* The home.stateVersion option does not have a default and must be set */
    home.stateVersion = "23.11";
    nixpkgs.config.allowUnfree = true;
  };

  environment.sessionVariables = {
    EDITOR = "nano";
    BROWSER = "${browser}";
    SHELL = "/run/current-system/sw/bin/${shell}";
    TERMINAL = "${terminal}";
    TERM = "xterm-256color";
    NIXPKGS_ALLOW_UNFREE = "1"; # To allow nix-shell to use unfree packages
  };

  system.nixos = {
    distroName = "Athena OS";
    distroId = "athena";
  };

  # Used mkForce to override/merge values in os-release. Needed because "text" attr is lib.types.lines type that is a mergeable type (so it appends values we assign to the attributes) mkForce prevents this appending because overwrites values.
  environment.etc."os-release" = mkForce {
    text = attrsToText osReleaseContents;
  };

  # ----- System Config -----
  # nix config
  nix = {
    package = pkgs.nixStable;
    settings = {
      extra-experimental-features = [
        "nix-command"
        "flakes"
      ];
      allowed-users = ["@wheel"]; #locks down access to nix-daemon
    };
  };
          
  # Allow unfree packages
  nixpkgs.config.allowUnfree = true;
   
  # Dont change.
  system.stateVersion = "23.11"; # Did you read the comment?
}
