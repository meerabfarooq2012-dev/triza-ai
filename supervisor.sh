#!/bin/bash
# Marketo Process Supervisor - keeps the server alive

LOG="/home/z/my-project/dev.log"
SERVER_CMD="node node_modules/.bin/next dev --port 3000 --hostname 0.0.0.0 --turbopack"

cd /home/z/my-project

echo "[$(date)] Supervisor starting..." > "$LOG"

while true; do
    echo "[$(date)] Starting Next.js server..." >> "$LOG"
    $SERVER_CMD >> "$LOG" 2>&1
    EXIT_CODE=$?
    echo "[$(date)] Server exited with code $EXIT_CODE" >> "$LOG"
    echo "[$(date)] Restarting in 2 seconds..." >> "$LOG"
    sleep 2
done
