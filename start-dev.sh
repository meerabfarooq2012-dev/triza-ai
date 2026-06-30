#!/bin/bash
export NODE_OPTIONS="--max-old-space-size=3072"
cd /home/z/my-project
while true; do
  echo "[$(date)] Starting dev server..."
  bun run dev >> /home/z/my-project/dev.log 2>&1
  echo "[$(date)] Server exited (code $?), restarting in 3s..."
  sleep 3
done
