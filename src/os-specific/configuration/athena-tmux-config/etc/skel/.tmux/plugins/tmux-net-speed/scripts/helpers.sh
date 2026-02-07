set_tmux_option() {
    local option="$1"
    local value="$2"
    tmux set-option -gq "$option" "$value"
}

get_tmux_option() {
    local option=$1
    local default_value=$2
    local option_value="$(tmux show-option -gqv "$option")"

    [[ -z "$option_value" ]] && echo $default_value || echo $option_value
}

get_os() {
    case "$OSTYPE" in
        linux*)   echo "linux" ;;
        darwin*)  echo "osx" ;;
        solaris*) echo "solaris" ;;
        freebsd*) echo "freebsd" ;;
        netbsd*)  echo "netbsd" ;;
        openbsd*) echo "openbsd" ;;
        bsd*)     echo "bsd" ;;
        msys*)    echo "windows" ;;
        *)        echo "unknown" ;;
    esac
}

sum_column() {
    awk '{sum += $1;}END{print sum;}'
}

# ref: https://unix.stackexchange.com/a/98790 @John
bytestohuman() {
    local L_BYTES="${1:-0}"
    local L_BASE="${2:-1024}"
    (awk -v bytes="${L_BYTES}" -v base="${L_BASE}" 'function human(x, base) {
         if(base!=1024)base=1000

         s="BKMGTEPYZ"
         while (x>=base && length(s)>1)
               {x/=base; s=substr(s,2)}
         s=substr(s,1,1)
         xf=((s=="B")?"%4d": (x > 99 ? "%4d" : "%4.1f"))
         return sprintf( (xf "%s\n"), x, s)
      }
      BEGIN{print human(bytes, base)}')
}
