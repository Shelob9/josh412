#!/bin/bash

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Get the current working directory
CURRENT_DIR="$(pwd)"

# Check if the script is being run from the same directory it is located in
if [ "$SCRIPT_DIR" != "$CURRENT_DIR" ]; then
  echo "Error: Script must be run from its directory: $SCRIPT_DIR"
  exit 1
fi

npx wp-env start

# Start a new tmux session named 'dev-session'
tmux new-session -d -s dev-session

# Split the window into two panes
tmux split-window -h

# Run 'npx wp-env start' in the first pane
tmux send-keys -t dev-session:0.0 'cd plugins/garden-source && npm run start' C-m

# Run 'cd workers/site && bun run dev' in the second pane
tmux send-keys -t dev-session:0.1 'cd workers/site && bun run dev' C-m

# Attach to the tmux session
tmux attach -t dev-session
