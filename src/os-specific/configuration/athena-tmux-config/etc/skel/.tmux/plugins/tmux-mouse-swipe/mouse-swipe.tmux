#!/usr/bin/env bash
#  shellcheck disable=SC2154
#  Directives for shellcheck directly after bang path are global
#
#   Copyright (c) 2021,2022: Jacob.Lundqvist@gmail.com
#   License: MIT
#
#   Part of https://github.com/jaclu/tmux-mouse-swipe
#
#   Version: 1.3.3 2022-09-27
#

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SCRIPTS_DIR="$CURRENT_DIR/scripts"

# shellcheck disable=SC1091
. "$SCRIPTS_DIR/utils.sh"

swipe_script="$SCRIPTS_DIR/handle_mouse_swipe.sh"


get_tmux_option() {
    gtm_option=$1
    gtm_default=$2
    gtm_value=$($TMUX_BIN show-option -gqv "$gtm_option")
    if [ -z "$gtm_value" ]; then
        echo "$gtm_default"
    else
        echo "$gtm_value"
    fi
    unset gtm_option
    unset gtm_default
    unset gtm_value
}


#
#  Aargh in shell boolean true is 0, but to make the boolean parameters
#  more relatable for users 1 is yes and 0 is no, so we need to switch
#  them here in order for assignment to follow boolean logic in caller
#
bool_param() {
    case "$1" in

        "0") return 1 ;;

        "1") return 0 ;;

        "yes" | "Yes" | "YES" | "true" | "True" | "TRUE" )
            #  Be a nice guy and accept some common positives
            return 0
            ;;

        "no" | "No" | "NO" | "false" | "False" | "FALSE" )
            #  Be a nice guy and accept some common negatives
            return 1
            ;;

        *)
            log_it "Invalid parameter bool_param($1)"
            error_msg "bool_param($1) - should be 0 or 1"
            ;;

    esac
    return 1 # default to False
}

#
#  Generic plugin setting I use to add Notes to keys that are bound
#  This makes this key binding show up when doing <prefix> ?
#  If not set to "Yes", no attempt at adding notes will happen
#  bind-key Notes were added in tmux 3.1, so should not be used on older versions!
#
if bool_param "$(get_tmux_option "@use_bind_key_notes_in_plugins" "No")"; then
    note="-Nplugin:$plugin_name"
else
    note=""
fi
log_it "note=[$note]"


#
#  This normally triggers the right click default popups, they don't
#  play well when we use right clicks for other purposes.
#
$TMUX_BIN unbind-key -n MouseDown3Pane


#
#  Telling handle_mose_swipe.sh to do an env check on first call.
#
#  I previously set this as a server setting with -s and it worked fine.
#  Until I whilst working on something else ran tmux customize-mode
#  tmux instantly crashed with "server exited unexpectedly".
#  It turned out this was caused by putting this user option with -s
#  tmux didn't show any error or warning when setting an -s user variable,
#  and it could be read fine with -s  :(
#
#  Either way now it is switched to a -g both here and in the handler script,
#  and this issue is gone!
#
$TMUX_BIN set-option -g @mouse_drag_status 'untested'


#
#   For all the info you need about Mouse events and locations, see
#   man tmux - MOUSE SUPPORT section. to find what best matches your needs.
#
# shellcheck disable=SC2086
$TMUX_BIN bind-key $note -n MouseDrag3Pane    run "$swipe_script down '#{mouse_x}' '#{mouse_y}'"
# shellcheck disable=SC2086
$TMUX_BIN bind-key $note -n MouseDragEnd3Pane run "$swipe_script up   '#{mouse_x}' '#{mouse_y}'"
