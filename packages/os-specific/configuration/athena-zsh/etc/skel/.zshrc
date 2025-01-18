# Lines configured by zsh-newuser-install
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=1000
setopt INC_APPEND_HISTORY
bindkey -e
ZSH_AUTOSUGGEST_STRATEGY=(history completion)
# End of lines configured by zsh-newuser-install
# The following lines were added by compinstall
zstyle :compinstall filename '$HOME/.zshrc'

alias shopt='/usr/bin/shopt'

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

if [[ $(tty) == */dev/tty* ]]; then
    PROMPT="%F{46}[HQ:%F{201}$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev) | %n%F{46}]"$'\n'"[>]%F{44}%~ $%f "
else
    PROMPT="%F{46}┌──[HQ🚀🌐%F{201}$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' | grep -oP '(?<=inet\s)\d+(\.\d+){3}' | sed -z 's/\n/|/g;s/|\$/\n/' | rev | cut -c 2- | rev)🔥%n%F{46}]"$'\n'"└──╼[👾]%F{44}%~ $%f "
fi

precmd() { eval "$PROMPT_COMMAND" }
export PROMPT_COMMAND='source ~/.zshrc no-repeat-flag'
if [[ $1 != no-repeat-flag && -z $NO_REPETITION ]]; then
  source ~/.bash_aliases
  source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
  source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
  neofetch
fi