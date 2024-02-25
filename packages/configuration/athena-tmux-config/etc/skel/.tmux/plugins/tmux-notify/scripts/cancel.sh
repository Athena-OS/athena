#!/usr/bin/env bash
## -- Cancel monitoring script
# Used to cancel the current  pane monitor job

# Get current directory
CURRENT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Source helpers and variables
source "$CURRENT_DIR/helpers.sh"
source "$CURRENT_DIR/variables.sh"

# Cancel pane monitoring if active
if [[ -f "$PID_FILE_PATH" ]]; then

  # Retrieve monitor process PID
  PID=$(cat "$PID_FILE_PATH")

  # Kill process and remove pid file
  kill "$PID"
  rm "${PID_DIR}/${PANE_ID}.pid"

  # Display success message
  tmux display-message "Pane monitoring canceled..."
else
  tmux display-message "Pane not monitored..."
  exit 0
fi
