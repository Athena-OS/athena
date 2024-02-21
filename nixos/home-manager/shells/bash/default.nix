{ home-manager, username, ... }:
{
    home-manager.users.${username} = { pkgs, ...}: {
      home.file.".bashrc".source = ./bashrc;
      home.file.".blerc".source = ./blerc;
      home.packages = with pkgs; [
        blesh
        nanorc
        neofetch
        nix-bash-completions
        zoxide
      ];
      programs.bash = {
        enableCompletion = true;
        # Below ''$ has been used to escape $ character
        bashrcExtra = ''
          append_path () {
              case ":$PATH:" in
                  *:"$1":*)
                      ;;
                  *)
                      PATH="${PATH:+$PATH:}$1"
              esac
          }
          append_path "$HOME/bin"
          append_path "$HOME/.local/bin"
          
          ### EXPORT ### Should be before the change of the shell
          export HISTCONTROL=ignoreboth:erasedups:ignorespace
          HISTSIZE=100000
          HISTFILESIZE=2000000
          shopt -s histappend
          export PAGER='most'
          
          #Ibus settings if you need them
          #type ibus-setup in terminal to change settings and start the daemon
          #delete the hashtags of the next lines and restart
          #export GTK_IM_MODULE=ibus
          #export XMODIFIERS=@im=dbus
          #export QT_IM_MODULE=ibus
          
          # COLOURS! YAAAY!
          export TERM=xterm-256color
          
          export BFETCH_INFO="pfetch"
          export BFETCH_ART="cowsay '<3 Athena OS'"
          export BFETCH_COLOR="$HOME/.local/textart/color/icon/panes.textart"
          
          export PAYLOADS="/run/current-system/sw/share/wordlists"
          export SECLISTS="$PAYLOADS/seclists"
          export PAYLOADSALLTHETHINGS="$PAYLOADS/PayloadsAllTheThings"
          export FUZZDB="$PAYLOADS/FuzzDB"
          export AUTOWORDLISTS="$PAYLOADS/Auto_Wordlists"
          export SECURITYWORDLIST="$PAYLOADS/Security-Wordlist"
          
          export MIMIKATZ="/run/current-system/sw/share/mimikatz/"
          export POWERSPLOIT="/run/current-system/sw/share/powersploit/"
          
          export ROCKYOU="$SECLISTS/Passwords/Leaked-Databases/rockyou.txt"
          export DIRSMALL="$SECLISTS/Discovery/Web-Content/directory-list-2.3-small.txt"
          export DIRMEDIUM="$SECLISTS/Discovery/Web-Content/directory-list-2.3-medium.txt"
          export DIRBIG="$SECLISTS/Discovery/Web-Content/directory-list-2.3-big.txt"
          export WEBAPI_COMMON="$SECLISTS/Discovery/Web-Content/api/api-endpoints.txt"
          export WEBAPI_MAZEN="$SECLISTS/Discovery/Web-Content/common-api-endpoints-mazen160.txt"
          export WEBCOMMON="$SECLISTS/Discovery/Web-Content/common.txt"
          export WEBPARAM="$SECLISTS/Discovery/Web-Content/burp-parameter-names.txt"
          
          # If not running interactively, don't do anything
          [[ $- != *i* ]] && return
          
          # switch shell
          [[ $(ps --no-header --pid=$PPID --format=comm) != "''${SHELL#/run/current-system/sw/bin/}" && -z ''${BASH_EXECUTION_STRING} && ''${SHELL} != *"bash"* ]] && exec $SHELL
          
          #Configure zoxide for bash
          eval "$(zoxide init bash)"
          
          if [[ $(tty) == */dev/tty* ]]; then
            PS1="\e[1;32m[HQ:\e[1;31m$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev) | \u\e[1;32m]\n[>]\[\e[1;36m\]\$(pwd) $ \[\e[0m\]"
          else
            PS1="\e[1;32m┌──[HQ🚀🌐\e[1;31m$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)🔥\u\e[1;32m]\n└──╼[👾]\[\e[1;36m\]\$(pwd) $ \[\e[0m\]"
          fi
          
          # Use bash-completion, if available
          [[ $PS1 && -f /run/current-system/sw/share/bash-completion/bash_completion ]] && \
              . /run/current-system/sw/share/bash-completion/bash_completion
          
          # Bash aliases
          if [ -f ~/.bash_aliases ]; then
            . ~/.bash_aliases
          fi
          
          
          # Change up a variable number of directories
          # E.g:
          #   cu   -> cd ../
          #   cu 2 -> cd ../../
          #   cu 3 -> cd ../../../
          function cu {
              local count=$1
              if [ -z "''${count}" ]; then
                  count=1
              fi
              local path=""
              for i in $(seq 1 ''${count}); do
                  path="''${path}../"
              done
              cd $path
          }
          
          
          # Open all modified files in vim tabs
          function vimod {
              vim -p $(git status -suall | awk '{print $2}')
          }
          
          # Open files modified in a git commit in vim tabs; defaults to HEAD. Pop it in your .bashrc
          # Examples:
          #     virev 49808d5
          #     virev HEAD~3
          function virev {
              commit=$1
              if [ -z "''${commit}" ]; then
                commit="HEAD"
              fi
              rootdir=$(git rev-parse --show-toplevel)
              sourceFiles=$(git show --name-only --pretty="format:" ''${commit} | grep -v '^$')
              toOpen=""
              for file in ''${sourceFiles}; do
                file="''${rootdir}/''${file}"
                if [ -e "''${file}" ]; then
                  toOpen="''${toOpen} ''${file}"
                fi
              done
              if [ -z "''${toOpen}" ]; then
                echo "No files were modified in ''${commit}"
                return 1
              fi
              vim -p ''${toOpen}
          }
          
          # 'Safe' version of __git_ps1 to avoid errors on systems that don't have it
          function gitPrompt {
            command -v __git_ps1 > /dev/null && __git_ps1 " (%s)"
          }
          
          # Colours have names too. Stolen from Arch wiki
          txtblk='\[\e[0;30m\]' # Black - Regular
          txtred='\[\e[0;31m\]' # Red
          txtgrn='\[\e[0;32m\]' # Green
          txtylw='\[\e[0;33m\]' # Yellow
          txtblu='\[\e[0;34m\]' # Blue
          txtpur='\[\e[0;35m\]' # Purple
          txtcyn='\[\e[0;36m\]' # Cyan
          txtwht='\[\e[0;37m\]' # White
          bldblk='\[\e[1;30m\]' # Black - Bold
          bldred='\[\e[1;31m\]' # Red
          bldgrn='\[\e[1;32m\]' # Green
          bldylw='\[\e[1;33m\]' # Yellow
          bldblu='\[\e[1;34m\]' # Blue
          bldpur='\[\e[1;35m\]' # Purple
          bldcyn='\[\e[1;36m\]' # Cyan
          bldwht='\[\e[1;37m\]' # White
          unkblk='\[\e[4;30m\]' # Black - Underline
          undred='\[\e[4;31m\]' # Red
          undgrn='\[\e[4;32m\]' # Green
          undylw='\[\e[4;33m\]' # Yellow
          undblu='\[\e[4;34m\]' # Blue
          undpur='\[\e[4;35m\]' # Purple
          undcyn='\[\e[4;36m\]' # Cyan
          undwht='\[\e[4;37m\]' # White
          bakblk='\[\e[40m\]'   # Black - Background
          bakred='\[\e[41m\]'   # Red
          badgrn='\[\e[42m\]'   # Green
          bakylw='\[\e[43m\]'   # Yellow
          bakblu='\[\e[44m\]'   # Blue
          bakpur='\[\e[45m\]'   # Purple
          bakcyn='\[\e[46m\]'   # Cyan
          bakwht='\[\e[47m\]'   # White
          txtrst='\[\e[0m\]'    # Text Reset
          
          # Prompt colours
          atC="''${txtpur}"
          nameC="''${txtpur}"
          hostC="''${txtpur}"
          pathC="''${txtgrn}"
          gitC="''${txtpur}"
          pointerC="''${txtgrn}"
          normalC="''${txtwht}"
          
          # Red name for root
          if [ "''${UID}" -eq "0" ]; then
            nameC="''${txtred}"
          fi
          
          #shopt
          shopt -s autocd # change to named directory
          shopt -s cdspell # autocorrects cd misspellings
          shopt -s cmdhist # save multi-line commands in history as single line
          shopt -s dotglob
          shopt -s histappend # do not overwrite history
          shopt -s expand_aliases # expand aliases
          
          # # ex = EXtractor for all kinds of archives
          # # usage: ex <file>
          ex ()
          {
            if [ -f $1 ] ; then
              case $1 in
                *.tar.bz2)   tar xjf $1   ;;
                *.tar.gz)    tar xzf $1   ;;
                *.bz2)       bunzip2 $1   ;;
                *.rar)       unrar x $1   ;;
                *.gz)        gunzip $1    ;;
                *.tar)       tar xf $1    ;;
                *.tbz2)      tar xjf $1   ;;
                *.tgz)       tar xzf $1   ;;
                *.zip)       unzip $1     ;;
                *.Z)         uncompress $1;;
                *.7z)        7z x $1      ;;
                *.deb)       ar x $1      ;;
                *.tar.xz)    tar xf $1    ;;
                *.tar.zst)   tar xf $1    ;;
                *)           echo "'$1' cannot be extracted via ex()" ;;
              esac
            else
              echo "'$1' is not a valid file"
            fi
          }
          
          export PROMPT_COMMAND='source ~/.bashrc no-repeat-flag'
          
          buffer_clean(){
            free -h && sudo sh -c 'echo 1 >  /proc/sys/vm/drop_caches' && free -h
          }
          
          if [[ $1 != no-repeat-flag && -z $NO_REPETITION ]]; then
            neofetch
          fi
          
          [[ $1 != no-repeat-flag && -f "$(which blesh-share)" ]] && source "$(blesh-share)"/ble.sh --attach=none
        '';
      };

      # Blesh: waiting for https://github.com/nix-community/home-manager/pull/3238 to be merged
      /* 
      programs.blesh = {
        enable = true;
        options = {
          prompt_ps1_transient = "trim:same-dir";
          prompt_ruler = "empty-line";
        };
        blercExtra = ''
          function my/complete-load-hook {
            bleopt complete_auto_history=
            bleopt complete_ambiguous=
            bleopt complete_menu_maxlines=10
          };
          blehook/eval-after-load complete my/complete-load-hook
        '';
      };
      */
    };
}
