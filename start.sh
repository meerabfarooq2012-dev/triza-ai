#!/bin/bash
cd /home/z/my-project
export NODE_OPTIONS="--max-old-space-size=256"
# Kill any existing server
pkill -f "next-server" 2>/dev/null
sleep 2
# Start fresh
exec node node_modules/next/dist/bin/next start -p 3000 -H 0.0.0.0
