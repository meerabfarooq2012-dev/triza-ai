#!/bin/bash
cd /home/z/my-project

# Start the dev server
npx next dev -p 3000 -H 0.0.0.0 --turbopack &
SERVER_PID=$!

# Keep-alive loop
while kill -0 $SERVER_PID 2>/dev/null; do
  sleep 10
  curl -s -o /dev/null http://localhost:3000/ 2>/dev/null
done

echo "Server died, restarting..."
exec $0
