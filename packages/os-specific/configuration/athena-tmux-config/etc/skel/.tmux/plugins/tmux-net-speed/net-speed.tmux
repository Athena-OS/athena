#!/usr/bin/env bash

SDIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
source "$SDIR/scripts/helpers.sh"

upload_speed_format()   {
    get_tmux_option @upload_speed_format   "%%7s"
}
download_speed_format() {
    get_tmux_option @download_speed_format "%%7s"
}

upload_speed="#($SDIR/scripts/net-speed.sh   tx_bytes '$(upload_speed_format)')"
download_speed="#($SDIR/scripts/net-speed.sh rx_bytes '$(download_speed_format)')"

upload_interpolation="\#{upload_speed}"
download_interpolation="\#{download_speed}"

do_interpolation() {
    local input=$1
    local result=""

    result=${input/$upload_interpolation/$upload_speed}
    result=${result/$download_interpolation/$download_speed}

    echo "$result"
}

update_tmux_option() {
    local option=$1
    local option_value=$(get_tmux_option "$option")
    set_tmux_option "$option" "$(do_interpolation "$option_value")"
}

main() {
    update_tmux_option "status-right"
    update_tmux_option "status-left"
}
main
