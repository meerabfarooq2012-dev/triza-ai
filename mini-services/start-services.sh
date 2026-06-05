#!/bin/bash
cd /home/z/my-project/mini-services/chat-service
bun index.ts > /home/z/my-project/mini-services/chat-service/log.txt 2>&1 &
CHAT_PID=$!
echo "Chat service PID: $CHAT_PID"

cd /home/z/my-project/mini-services/notification-service
bun index.ts > /home/z/my-project/mini-services/notification-service/log.txt 2>&1 &
NOTIF_PID=$!
echo "Notification service PID: $NOTIF_PID"

# Wait a moment for services to start
sleep 2

# Verify services are running
if kill -0 $CHAT_PID 2>/dev/null; then
  echo "Chat service is running on port 3003"
else
  echo "WARNING: Chat service may not be running"
fi

if kill -0 $NOTIF_PID 2>/dev/null; then
  echo "Notification service is running on port 3004 (HTTP push on 3005)"
else
  echo "WARNING: Notification service may not be running"
fi

# Keep script alive to prevent child processes from being killed
wait
