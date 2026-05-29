#!/bin/bash
# Keep the server alive by restarting it if it dies
while true; do
  npx next start -p 3000 -H 0.0.0.0
  echo "Server died, restarting in 2 seconds..."
  sleep 2
done
