{ pkgs, lib, home-manager, username, ... }:
with lib;
let
  shopt = pkgs.writeShellScriptBin "shopt"
    (builtins.readFile ./shopt);
in
{
    # Needed to install at system-level to source their .zsh files in .zshrc
    environment.systemPackages = with pkgs; [
      nix-zsh-completions
      zsh-autosuggestions
      zsh-syntax-highlighting
    ];
    home-manager.users.${username} = { pkgs, ...}: {
      home.packages = with pkgs; [
        neofetch
        shopt
      ];
      home.file.".zshrc".source = ./zshrc;
      programs.zsh = {
        enable = true;
        enableAutosuggestions = true;
        enableCompletion = true;
        syntaxHighlighting.enable = true;
        /*shellAliases = {
          ll = "ls -l";
          update = "sudo nixos-rebuild switch";
        };*/
        #histSize = 10000;
        #histFile = "${config.xdg.dataHome}/zsh/history";
        zplug = {
          enable = true;
          plugins = [
            { name = "zsh-users/zsh-autosuggestions"; } # Simple plugin installation
            { name = "zsh-users/zsh-history-substring-search"; } # Simple plugin installation
            { name = "zsh-users/zsh-syntax-highlighting"; } # Simple plugin installation
            { name = "romkatv/powerlevel10k"; tags = [ as:theme depth:1 ]; } # Installations with additional options. For the list of options, please refer to Zplug README.
          ];
        };
        history = {
          expireDuplicatesFirst = true;
          save = 1000;
          size = 10000;
          path = "~/.zsh_history";
        };
        completionInit = ''
          # The following lines were added by compinstall
          zstyle :compinstall filename '$HOME/.zshrc'

          alias shopt='/run/current-system/sw/bin/shopt'

          bindkey "^[[1;5C" forward-word
          bindkey "^[[1;5D" backward-word
          bindkey "\e[1~" beginning-of-line
          bindkey "\e[4~" end-of-line
          bindkey "\e[5~" beginning-of-history
          bindkey "\e[6~" end-of-history
          bindkey "\e[7~" beginning-of-line
          bindkey "\e[3~" delete-char
          bindkey "\e[2~" quoted-insert
          bindkey "\e[5C" forward-word
          bindkey "\e[5D" backward-word
          bindkey "\e\e[C" forward-word
          bindkey "\e\e[D" backward-word
          bindkey "\e[1;5C" forward-word
          bindkey "\e[1;5D" backward-word
          bindkey "\e[8~" end-of-line
          bindkey "\eOH" beginning-of-line
          bindkey "\eOF" end-of-line
          bindkey "\e[H" beginning-of-line
          bindkey "\e[F" end-of-line

          autoload -U +X bashcompinit && bashcompinit
          autoload -U +X compinit && compinit
          # End of lines added by compinstall
        '';
        envExtra = ''
          export PROMPT_COMMAND='source ~/.zshrc no-repeat-flag'
        '';
        initExtra = ''
          setopt INC_APPEND_HISTORY
          bindkey -e
          precmd() { eval "$PROMPT_COMMAND" }
        '';
      };
    };
}