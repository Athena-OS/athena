#!/usr/bin/env bash
## -- Start monitoring script

# Get current directory
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Source helpers and variables
source "$CURRENT_DIR/helpers.sh"
source "$CURRENT_DIR/variables.sh"

## Functions

on_cancel()
{
  # Wait a bit for all pane monitors to complete
  sleep "$monitor_sleep_duration_value"

  # Preform cleanup operation is monitoring was canceled
  if [[ -f "$PID_FILE_PATH" ]]; then
    kill "$PID"
    rm "${PID_DIR}/${PANE_ID}.pid"
  fi
  exit 0
}
trap 'on_cancel' TERM

# Check if verbose option is enabled
verbose_enabled() {
	local verbose_value="$(get_tmux_option "$verbose_option" "$verbose_default")"
	[ "$verbose_value" != "on" ]
}

## Main script

# Monitor pane if it is not already monitored
if [[ ! -f "$PID_FILE_PATH" ]]; then  # If pane not yet monitored

  # job started - create pid-file
  echo "$$" > "$PID_FILE_PATH"

  # Display tnotify start messsage
  tmux display-message "Montoring pane..."

  # Construct tnotify finish message
  if verbose_enabled; then  # If @tnotify-verbose is disabled
    complete_message="Tmux pane task completed!"
  else  # If @tnotify-verbose is enabled
    verbose_msg_value="$(get_tmux_option "$verbose_msg_option" "$verbose_msg_default")"
    complete_message=$(tmux display-message -p "$verbose_msg_value")
  fi

  # Check process status every 10 seconds to see if has is finished
  while true; do

    # capture pane output
    output=$(tmux capture-pane -pt %"$PANE_ID")

    # run tests to determine if work is done
    # if so, break and notify
    lc=$(echo "$output" | tail -c2)
    case $lc in
    "$" | "#" | "%")
      # tmux display-message "$@"
      if [[ "$1" == "refocus" ]]; then
        tmux switch -t \$"$SESSION_ID"
        tmux select-window -t @"$WINDOW_ID"
        tmux select-pane -t %"$PANE_ID"
      fi
      # notify-send does not always work due to changing dbus params
      # see https://superuser.com/questions/1118878/using-notify-send-in-a-tmux-session-shows-error-no-notification#1118896
      notify-send "$complete_message"
      # trigger visual bell
      # your terminal emulator can be setup to set URGENT bit on visual bell
      # for eg, Xresources -> URxvt.urgentOnBell: true
      tmux split-window "echo -e \"\a\" && exit"
      break
    esac

    # Sleep for a given time
    monitor_sleep_duration_value=$(get_tmux_option "$monitor_sleep_duration" "$monitor_sleep_duration_default")
    sleep "$monitor_sleep_duration_value"
  done

  # job done - remove pid file and return
  if [[ -f "$PID_FILE_PATH" ]]; then
    rm "$PID_FILE_PATH"
  fi
  exit 0
else  # If pane is already being monitored

  # Display pane already monitored message
  tmux display-message "Pane already monitored..."
  exit 0
fi
