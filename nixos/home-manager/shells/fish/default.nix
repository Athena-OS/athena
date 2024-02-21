{ home-manager, username, ... }:
{
    home-manager.users.${username} = { pkgs, ...}: {
      home.packages = with pkgs; [
        neofetch
        zoxide
      ];
      programs.fish = {
        enable = true;
        functions = {
          fish_prompt.body = ''
            set -l var (tty)
            switch $var
                case '*/dev/tty*'
                    set_color 00ff00
                    echo -n "[HQ:"
                    set_color ff00d7
                    echo -n "$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)"
                    echo -n " | $USER"
                    set_color 00ff00
                    echo "]"
                    set_color 00ff00
                    echo -n "[>]"
                    set_color 00ffff
                    echo (pwd) '$' (set_color normal)
                case '*'
                    set_color 00ff00
                    echo -n "┌──[HQ🚀🌐"
                    set_color ff00d7
                    echo -n "$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)"
                    echo -n "🔥$USER"
                    set_color 00ff00
                    echo "]"
                    set_color 00ff00
                    echo -n "└──╼[👾]"
                    set_color 00ffff
                    echo (pwd) '$' (set_color normal)
            end
          '';
        };
        interactiveShellInit = ''
          set fish_greeting # Disable greeting
          if status is-interactive
              # Commands to run in interactive sessions can go here
          end

          source ~/.bash_aliases

          zoxide init fish | source

          #set -x BFETCH_INFO "pfetch"
          #set -x BFETCH_ART "$HOME/.local/textart/fetch/unix.textart"
          #set -x PF_INFO "Unix Genius"

          #set -x BFETCH_INFO "curl --silent --location 'wttr.in/rome?0pq'"
          #set -x BFETCH_ART "printf \"\033[35m\"; figlet -f Bloody Spooky"
          #set -x BFETCH_COLOR "$HOME/.local/textart/color/icon/ghosts.textart"

          #set -x BFETCH_INFO "exa -la"
          #set -x BFETCH_ART "$HOME/.local/textart/fetch/pacman-maze.textart"
          #set -x BFETCH_COLOR "$HOME/.local/textart/color/icon/pacman.textart"

          set -x BFETCH_INFO "pfetch"
          set -x BFETCH_ART "cowsay '<3 Athena OS'"
          set -x BFETCH_COLOR "$HOME/.local/textart/color/icon/panes.textart"

          set -x PAYLOADS "/run/current-system/sw/share/wordlists"
          set -x SECLISTS "$PAYLOADS/seclists"
          set -x PAYLOADSALLTHETHINGS "$PAYLOADS/PayloadsAllTheThings"
          set -x FUZZDB "$PAYLOADS/FuzzDB"
          set -x AUTOWORDLISTS "$PAYLOADS/Auto_Wordlists"
          set -x SECURITYWORDLIST "$PAYLOADS/Security-Wordlist"

          set -x MIMIKATZ "/run/current-system/sw/share/mimikatz/"
          set -x POWERSPLOIT "/run/current-system/sw/share/powersploit/"

          set -x ROCKYOU "$SECLISTS/Passwords/Leaked-Databases/rockyou.txt"
          set -x DIRSMALL "$SECLISTS/Discovery/Web-Content/directory-list-2.3-small.txt"
          set -x DIRMEDIUM "$SECLISTS/Discovery/Web-Content/directory-list-2.3-medium.txt"
          set -x DIRBIG "$SECLISTS/Discovery/Web-Content/directory-list-2.3-big.txt"
          set -x WEBAPI_COMMON "$SECLISTS/Discovery/Web-Content/api/api-endpoints.txt"
          set -x WEBAPI_MAZEN "$SECLISTS/Discovery/Web-Content/common-api-endpoints-mazen160.txt"
          set -x WEBCOMMON "$SECLISTS/Discovery/Web-Content/common.txt"
          set -x WEBPARAM "$SECLISTS/Discovery/Web-Content/burp-parameter-names.txt"

          set -gx TERM xterm-256color
          if status is-interactive
              # Commands to run in interactive sessions can go here
              #if not set -q NO_REPETITION
              #    neofetch
              #end
          end
        '';
      };
    };
}
