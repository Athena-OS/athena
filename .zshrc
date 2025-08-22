# --- History Configuration ---
HISTFILE=~/.zsh_history
HISTSIZE=10000
SAVEHIST=1000
setopt INC_APPEND_HISTORY

# --- Keybindings ---
bindkey -e

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

# --- Bash-like compatibility (for some completions) ---
autoload -U +X bashcompinit && bashcompinit
autoload -U +X compinit && compinit

# --- Alias ---
alias shopt='/usr/bin/shopt'

# --- One-time plugin & environment setup ---
if [[ -z $NO_REPETITION ]]; then
  source ~/.bash_aliases
  source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
  source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh
  fastfetch
  export NO_REPETITION=1
fi

# --- Fish-style dynamic prompt function ---
function build_prompt() {
  local last_status=$?
  local tty_device=$(tty)
  local ip=$(ip -4 addr | grep -v '127.0.0.1' | grep -v 'secondary' \
    | grep -oP '(?<=inet\s)\d+(\.\d+){3}' \
    | sed -z 's/\n/|/g;s/|\$/\n/' \
    | rev | cut -c 2- | rev)

  local user="%n"
  local host="%m"
  local cwd="%~"
  local branch=""
  local hq_prefix=""
  local flame=""
  local robot=""
  
  # Git branch detection
  if command -v git &>/dev/null; then
    branch=$(git symbolic-ref --short HEAD 2>/dev/null)
  fi

  # Emoji mode detection
  if [[ "$tty_device" == /dev/tty* ]]; then
    hq_prefix="HQ─"
    flame=""
    robot="[>]"
  else
    hq_prefix="HQ🚀🌐"
    flame="🔥"
    robot="[👾]"
  fi

  # Color for user@host based on last status
  if [[ $last_status -eq 0 ]]; then
    user_host="%F{blue}(${user}@${host})%f"
  else
    user_host="%F{red}(${user}@${host})%f"
  fi

  # First line
  local line1="%F{46}╭─[${hq_prefix}%F{196}${ip}%F{46}${flame}]─${user_host}"
  if [[ -n "$branch" ]]; then
    line1+="%F{220}[ $branch]%f"
  fi

  # Second line
  local line2="%F{46}╰─>$robot%F{44}${cwd} $%f"

  PROMPT="${line1}"$'\n'"${line2} "
}

autoload -Uz add-zsh-hook
add-zsh-hook precmd build_prompt
