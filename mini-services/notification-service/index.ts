import { Server } from "socket.io";

const PORT = 3004;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track user-socket mapping: userId -> Set<socketId>
const userSocketsMap = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(`[NotificationService] Socket connected: ${socket.id}`);

  // ─── Register User ─────────────────────────────────────────────
  socket.on(
    "register-user",
    (data: { userId: string }) => {
      const { userId } = data;
      const roomName = `user:${userId}`;

      // Track socket mapping
      if (!userSocketsMap.has(userId)) {
        userSocketsMap.set(userId, new Set());
      }
      userSocketsMap.get(userId)!.add(socket.id);

      // Join the user's personal room
      socket.join(roomName);
      console.log(
        `[NotificationService] User ${userId} registered (room: ${roomName}, sockets: ${userSocketsMap.get(userId)!.size})`
      );
    }
  );

  // ─── Push Notification ─────────────────────────────────────────
  socket.on(
    "push-notification",
    (data: {
      userId: string;
      notification: {
        id: string;
        title: string;
        message: string;
        type: string;
        category: string;
        link?: string;
        image?: string;
        priority: string;
        createdAt: string;
      };
    }) => {
      const { userId, notification } = data;
      const roomName = `user:${userId}`;

      console.log(
        `[NotificationService] Pushing notification to user ${userId}: "${notification.title}"`
      );

      // Emit to the user's room (all their connected sockets)
      io.to(roomName).emit("new-notification", notification);
    }
  );

  // ─── Mark Notification Read ────────────────────────────────────
  socket.on(
    "notification-read",
    (data: { userId: string; notificationId: string }) => {
      const { userId, notificationId } = data;
      const roomName = `user:${userId}`;

      // Broadcast to all user's sockets that a notification was read
      io.to(roomName).emit("notification-updated", {
        notificationId,
        isRead: true,
      });
    }
  );

  // ─── Mark All Read ─────────────────────────────────────────────
  socket.on(
    "all-notifications-read",
    (data: { userId: string }) => {
      const { userId } = data;
      const roomName = `user:${userId}`;

      io.to(roomName).emit("all-read", { userId });
    }
  );

  // ─── Unread Count Update ───────────────────────────────────────
  socket.on(
    "unread-count-update",
    (data: { userId: string; count: number }) => {
      const { userId, count } = data;
      const roomName = `user:${userId}`;

      io.to(roomName).emit("unread-count", { count });
    }
  );

  // ─── Delete Notification ───────────────────────────────────────
  socket.on(
    "notification-deleted",
    (data: { userId: string; notificationId: string }) => {
      const { userId, notificationId } = data;
      const roomName = `user:${userId}`;

      io.to(roomName).emit("notification-removed", { notificationId });
    }
  );

  // ─── Disconnect ────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    // Clean up user-socket mapping
    for (const [userId, sockets] of userSocketsMap.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSocketsMap.delete(userId);
        }
        console.log(
          `[NotificationService] Socket disconnected: ${socket.id} (user: ${userId}, reason: ${reason})`
        );
        break;
      }
    }
  });
});

console.log(`[NotificationService] Socket.io notification service running on port ${PORT}`);
