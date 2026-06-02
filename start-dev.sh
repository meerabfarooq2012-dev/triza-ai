#!/bin/bash
cd /home/z/my-project
while true; do
  # Kill any existing next processes
  pkill -f "next dev" 2>/dev/null
  sleep 2
  
  # Start the dev server
  npx next dev -p 3000 -H 0.0.0.0 --turbopack > /home/z/my-project/dev.log 2>&1
  echo "Server died, restarting..." >> /home/z/my-project/dev.log
  sleep 5
done
