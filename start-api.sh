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


cd workers/site
bun run dev
