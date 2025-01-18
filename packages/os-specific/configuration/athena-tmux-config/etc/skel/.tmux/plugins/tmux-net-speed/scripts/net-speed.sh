#!/usr/bin/env bash

SDIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$SDIR/helpers.sh"

# $1: rx_bytes/tx_bytes
get_bytes() {
    case $(get_os) in
        osx)
            netstat -ibn | sort -u -k1,1 | grep ':' | grep -Ev '^(lo|docker).*' |
                awk '{rx += $7;tx += $10;}END{print "rx_bytes "rx,"\ntx_bytes "tx}' |
                grep "$1" | awk '{print $2}'
            ;;
        linux)
            for file in /sys/class/net/*; do
                [[ $file =~ .*/(lo|docker.*) ]] || cat "$file/statistics/$1"
            done | sum_column 2>/dev/null
            ;;
        freebsd)
            netstat -ibnW | sort -u -k1,1 | grep ':' | grep -Ev '^lo.*' |
                awk '{rx += $8;tx += $11;}END{print "rx_bytes "rx,"\ntx_bytes "tx}' |
                grep "$1" | awk '{print $2}'
            ;;
        netbsd|openbsd)
            netstat -ibn | sort -u -k1,1 | grep ':' | grep -Ev '^lo.*' |
                awk '{rx += $5;tx += $6;}END{print "rx_bytes "rx,"\ntx_bytes "tx}' |
                grep "$1" | awk '{print $2}'
            ;;
        *)
            echo 0
            ;;
    esac
}

# $1: rx_bytes/tx_bytes
get_speed() {
    local pre cur diff speed pre_var
    pre_var="@netspeed_$1"
    cur=$(get_bytes "$1")
    pre=$(get_tmux_option "$pre_var" "$cur")
    diff=$((cur - pre))
    (( diff < 0 )) && diff=0
    speed=$(bytestohuman $diff)
    # speed=$(numfmt --to=iec --padding=7 $diff)
    echo "${speed}/s"
    set_tmux_option "$pre_var" "$cur"
}

# $1: tx_bytes/tx_bytes
# $2: format
main() {
    printf "${2:-%8s}" "$(get_speed "$1")"
}

main "$@"
