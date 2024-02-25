#!/bin/sh
__version="1.5.2 2022-09-15"
#
#   Copyright (c) 2021,2022: Jacob.Lundqvist@gmail.com
#   License: MIT
#
#   Part of https://github.com/jaclu/tmux-mouse-swipe
#
#   This enables changing tmux windows or sessions by triggering the events
#   defined in mouse_swipe.tmux
#

# shellcheck disable=SC1007
CURRENT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

# shellcheck disable=SC1091
. "$CURRENT_DIR/utils.sh"


#
#  If you do not want to use a cache file during swipe operations
#  simplest is to just comment out the entire line, all code checks
#  if variable is defined, before using it.
#
#  On my machine using a cache file is approx 20 times faster than storing
#  the values inside a tmux variable. You can test it on your system
#  by running benchmark.sh
#
drag_stat_cache_file="/tmp/drag_status_cache"

#
#  set it to 1 if you are running the benchmark script, but be aware
#  this will prevent any context switches, so should normally always be 0
#
benchmarking=0



action_name="$1"
mouse_x="$2"
mouse_y="$3"


min_version="3.0"

env_untested="untested"
env_incompatible="incompatible"
no_drag=0


#
#  Log if log_lvl <= debug_lvl
#
debug() {
    log_lvl="$1"
    msg="$2"

    case "$log_lvl" in
        (*[!0123456789]*)
            log_it "ERROR log_lvl [$log_lvl] not an integer value!"
            exit 1
            ;;
    esac

    #
    # level 0 is always displayed directly in tmux
    #
    #  shellcheck disable=SC2154
    [ "$log_lvl" -le "$debug_lvl" ] && log_it "{$log_lvl} $msg"
    [ "$log_lvl" -eq 0 ]  && $TMUX_BIN display "$msg"
}


verify_file_writeable() {
    varibale_name="$1"
    fname="$2"

    if [ -z "$fname" ]; then
        echo "ERROR: verify_file_writeable() - no fname param!"
        exit 1
    fi
    if [ -z "$varibale_name" ]; then
        echo "ERROR: verify_file_writeable() - no varibale_name param!"
        exit 1
    fi

    file_dir="$( dirname "$fname")"
    if ! mkdir -p "$file_dir" 2> /dev/null ; then
        echo "ERROR: $varibale_name - Can not create the directory for [$fname]!"
        exit 1
    fi

    if ! touch "$fname" 2> /dev/null; then
        echo "ERROR: $varibale_name - Can not create the file [$fname]!"
        exit 1
    fi
}


param_checks() {
    #
    #  Param check
    #
    case "$benchmarking" in
        (*[!01]*)
            echo "ERROR bench marking [$benchmarking] must be 0 or 1!"
            exit 1
            ;;
    esac

    case "$debug_lvl" in
        (*[!0123456789]*)
            echo "ERROR debug_lvl [$debug_lvl] not an integer value!"
            exit 1
            ;;
    esac

    [ -n "$drag_stat_cache_file" ] && verify_file_writeable \
        drag_stat_cache_file  "$drag_stat_cache_file"
    [ -n "$log_file" ] && verify_file_writeable \
        log_file  "$log_file"

    echo "Completed parameters check"
}


drag_status_set() {
    status="$1"
    push_it="$2"

    debug 3 "drag_status_set($status, $push_it)"
    if [ -n "$drag_stat_cache_file" ]; then
        debug 4 "writing [$status] to $drag_stat_cache_file"
        if ! echo "$status" > $drag_stat_cache_file; then
            echo "ERROR! cant write to drag_stat_cache_file [$drag_stat_cache_file]!"
            exit 1
        fi
    else
        push_it=1 # not using cache, force saving to tmux
    fi
    drag_status="$status"
    if [ "$push_it" = "1" ]; then
        debug 4 "pushing status to tmux: $status"
        $TMUX_BIN set-option -g @mouse_drag_status "$status"
    fi
}


drag_status_get() {

    debug 5 "drag_status_get($mouse_x, $mouse_y)"
    if [ -n "$drag_stat_cache_file" ] && [ -f "$drag_stat_cache_file" ]; then
        drag_status="$(cat $drag_stat_cache_file)"
        debug 4 "< reading $drag_stat_cache_file, found: $drag_status"
    else
        drag_status="untested"
        ds_prel="$($TMUX_BIN show -g @mouse_drag_status)"
        drag_status="$(echo "$ds_prel" | cut -d' ' -f 2)"
        debug 4 "< drag_status_get: prel[$ds_prel] status[$drag_status]"
    fi
}


incompatible_env() {
    msg="$1"
    if [ "$drag_status" != $env_incompatible ]; then
        echo " "
        #  shellcheck disable=SC2154
        echo "$plugin_name vers: $__version Detected an incompatible environment, and is now disabled"
        echo "Details should be bellow, press Escape when you have read this."
        echo "If you want to use this with limited functionality, change min_version in this script"
        echo "accordingly."
        echo " "
        drag_status=$env_incompatible
        drag_status_set "$drag_status" 1
    fi
    debug 0 "$plugin_name *** Incompatibility: $msg"
    echo "$msg"
}


env_check() {
    debug 3 "env_check()"
    vers="$($TMUX_BIN -V | cut -d' ' -f 2)"

    if [ "$drag_status" = "$env_incompatible" ]; then
        debug 0 "$plugin_name ERROR: env incompatible"
        clear_status
        exit 0
    elif [ "$drag_status" = "$env_untested" ] || [ -z "$drag_status" ]; then
        if [ -z "$vers" ]; then
            incompatible_env "Can not detect the running tmux version, this tool needs at least tmux vers: $min_version"
            incompatible_env "Since it can't be detected to not be compatible, it will now be re-activated, but no guarantee anything will work."
            drag_status=$no_drag
            drag_status_set $drag_status 1
            return
        fi
        if  expr "'$vers" \< "'3.0"   > /dev/null ; then
            incompatible_env "vers < 3.0 no mouse_x / mouse_y support, so this utility can not work properly"
        fi
        if  expr "'$vers" \< "'$min_version"   > /dev/null ; then
            incompatible_env "$TMUX_BIN $vers < min vers: $min_version"
            clear_status
            exit 0
        fi
        debug 6 "no env issues found"
        drag_status=$no_drag
        drag_status_set $drag_status 1
    fi
}


handle_up() {
    debug 3 "handle_up($mouse_x, $mouse_y)"

    case "$drag_status" in

        "$env_incompatible" )
            return
    esac

    org_mouse_x="${drag_status%%-*}"
    org_mouse_y="${drag_status#*-}"

    diff_x=$(( mouse_x - org_mouse_x ))
    diff_y=$(( mouse_y - org_mouse_y ))

    # get abs of diffs
    abs_x=${diff_x#-}
    abs_y=${diff_y#-}

    debug 2 "diff abs: [$abs_x][$abs_y] rel: [$diff_x][$diff_y]"

    if [ $(( abs_x + abs_y )) -eq 0 ]; then  # no movement
        debug 0 "$plugin_name: Did not detect any movement!"

    elif [ "$abs_x" -gt "$abs_y" ] ; then    # Horizontal swipe
        if [ "$($TMUX_BIN list-windows -F '#{window_id}' | wc -l)" -lt 2 ]; then
            debug 0 "$plugin_name: Only one window, can't switch!"
            return
        elif [ "$mouse_x" -gt "$org_mouse_x" ]; then
            debug 1 "will switch to the right"
            [ "$benchmarking" -eq 0 ] && $TMUX_BIN select-window -n
        else
            debug 1 "will switch to the left"
            [ "$benchmarking" -eq 0 ] && $TMUX_BIN select-window -p
        fi

    elif [ "$abs_x" -eq "$abs_y" ] ; then    # Unclear direction
        debug 0 "$plugin_name: equal horizontal and vertical movement, direction unclear!"

    else                                     # Vertical swipe
        if [ "$($TMUX_BIN list-sessions | wc -l)" -lt "2" ]; then
            debug 0 "$plugin_name: Only one session, can't switch!"
            return
        elif [ "$mouse_y" -gt "$org_mouse_y" ]; then
            debug 1 "will switch to next session"
            [ "$benchmarking" -eq 0 ] && $TMUX_BIN switch-client -n
        else
            debug 1 "will switch to previous session"
            [ "$benchmarking" -eq 0 ] && $TMUX_BIN switch-client -p
        fi
    fi
}


clear_status() {
    debug 5 "clear_status()"
    if [ "$drag_status" != "$env_incompatible" ]; then
        if [ -f "$drag_stat_cache_file" ]; then
            remove_cache
        else
            drag_status_set "$no_drag" 1 # reset it even if we dont move windows
        fi
    else
        remove_cache
    fi
    debug 9 ""
}


remove_cache() {
    debug 5 "remove_cache()"
    if [ -n "$drag_stat_cache_file" ] && [ -f "$drag_stat_cache_file" ]; then
        debug 4 "Found cache file [$drag_stat_cache_file], removing it"
        rm "$drag_stat_cache_file"
    fi
}


main() {
    debug 9 "$plugin_name called - parameters: [$action_name] [$mouse_x] [$mouse_y]"

    drag_status_get

    debug 9 "initial drag_status[$drag_status]"

    case "$drag_status" in

        "$env_untested" | "")
            env_check
            ;;

        "$env_incompatible")
            debug 0 "$plugin_name ERROR: incompatible env!"
            clear_status
            exit 0
    esac

    debug 9 "verified drag_status [$drag_status]"
    if [ "$action_name" = "down" ] && [ "$drag_status" = "$no_drag" ]; then
        drag_status_set "$mouse_x-$mouse_y"  #  Start drag detected
    elif [ "$action_name" = "up" ]; then
        handle_up
        clear_status
    fi
}


#================================================================
#
#   Main
#

case "$action_name" in

    "down" | "up" ) main ;;

    "paramcheck" ) param_checks ;;

    *)  echo
        echo "ERROR: bad param! [$action_name]"
        echo
        echo "Valid parameters:"
        echo "  paramcheck  ensures all used settings are valid"
        echo
        echo "  down / up   Normal plugin usage"
        echo
        exit 1
        ;;
esac

exit 0


