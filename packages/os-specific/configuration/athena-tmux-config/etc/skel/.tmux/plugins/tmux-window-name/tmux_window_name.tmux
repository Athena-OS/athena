#!/usr/bin/env bash

CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pip_list=$(python3 -m pip list 2> /dev/null)
if ! echo "$pip_list" | grep libtmux -q; then
    tmux display "ERROR: tmux-window-name - Python dependency libtmux not found (Check the README)"
    exit 0
fi

tmux set -g automatic-rename on # Set automatic-rename on to make #{automatic-rename} be on when a new window is been open without a name
tmux set-hook -g 'after-new-window[8921]' 'set -wF @tmux_window_name_enabled \#\{automatic-rename\} ; set -w automatic-rename off'
tmux set-hook -g 'after-select-window[8921]' "run-shell -b ""$CURRENT_DIR""/scripts/rename_session_windows.py"

############################################################################################
### Hacks for preserving users custom window names, read more at enable_user_rename_hook ###
############################################################################################

"$CURRENT_DIR"/scripts/rename_session_windows.py --enable_rename_hook

# Disabling rename hooks when tmux-ressurect restores the sessions
tmux set -g @resurrect-hook-pre-restore-all ""$CURRENT_DIR"/scripts/rename_session_windows.py --disable_rename_hook"
tmux set -g @resurrect-hook-post-restore-all ""$CURRENT_DIR"/scripts/rename_session_windows.py --post_restore"
