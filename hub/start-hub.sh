#!/usr/bin/env bash
# Start the hub. Extra flags are passed through, e.g.  ./start-hub.sh --permission-mode auto
cd "$(dirname "$0")"
exec python3 hub.py "$@"
