import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import http from "http";

const PORT = 3004;

// ─── JWT Configuration ────────────────────────────────────────────────────
// Must match the JWT_SECRET used by the main Next.js app (auth-middleware.ts)
// SECURITY: JWT_SECRET must be set — no fallback (prevents token forgery)
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error(
    "[SECURITY] JWT_SECRET environment variable is NOT set! Notification service cannot authenticate users. Refusing to start."
  );
  process.exit(1);
}

// ─── Allowed CORS Origins ─────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_URL || "http://localhost:3000",
  "https://thiora.vercel.app",
];

// ─── Socket.io Server ─────────────────────────────────────────────────────

const io = new Server(PORT, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST"],
  },
});

// ─── JWT Authentication Middleware ─────────────────────────────────────────
io.use((socket, next) => {
  const token =
    socket.handshake.auth.token ||
    (socket.handshake.query.token as string | undefined);

  if (!token) {
    return next(new Error("Authentication required"));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Invalid token"));
  }
});

// Track user-socket mapping: userId -> Set<socketId>
const userSocketsMap = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(
    `[NotificationService] Socket connected: ${socket.id} (user: ${socket.data.user?.userId})`
  );

  // ─── Register User ─────────────────────────────────────────────
  socket.on(
    "register-user",
    (data: { userId: string }) => {
      const { userId } = data;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

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

      // Only allow pushing to yourself (client-side); server-side uses /push HTTP endpoint
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

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

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

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

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

      const roomName = `user:${userId}`;

      io.to(roomName).emit("all-read", { userId });
    }
  );

  // ─── Unread Count Update ───────────────────────────────────────
  socket.on(
    "unread-count-update",
    (data: { userId: string; count: number }) => {
      const { userId, count } = data;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

      const roomName = `user:${userId}`;

      io.to(roomName).emit("unread-count", { count });
    }
  );

  // ─── Delete Notification ───────────────────────────────────────
  socket.on(
    "notification-deleted",
    (data: { userId: string; notificationId: string }) => {
      const { userId, notificationId } = data;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

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

// ─── Helper: Verify admin or JWT auth for HTTP endpoints ──────────────────
function verifyHttpAuth(
  req: http.IncomingMessage
): { authorized: boolean; user?: { userId: string; email: string; role: string }; error?: string } {
  const adminSecret = req.headers["x-admin-secret"] as string | undefined;
  const adminSetupKey = process.env.ADMIN_SETUP_KEY;

  // Check admin secret first
  if (adminSecret && adminSetupKey && adminSecret === adminSetupKey) {
    return { authorized: true };
  }

  // Check Bearer token (JWT)
  const authHeader = req.headers["authorization"] as string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET!) as {
        userId: string;
        email: string;
        role: string;
      };
      return { authorized: true, user: decoded };
    } catch {
      return { authorized: false, error: "Invalid token" };
    }
  }

  return { authorized: false, error: "Authentication required" };
}

// ─── HTTP Push Endpoint ───────────────────────────────────────────────────
// Allows server-side code (e.g., Next.js API routes) to push notifications
// by POSTing to http://localhost:3005/push with { userId, notification }
// Requires either x-admin-secret header matching ADMIN_SETUP_KEY or
// a valid JWT Bearer token in the Authorization header.

const httpServer = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/push") {
    // Authenticate
    const auth = verifyHttpAuth(req);
    if (!auth.authorized) {
      res.writeHead(401, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: auth.error }));
      return;
    }

    try {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }

      const data = JSON.parse(body);
      const { userId, notification } = data;

      if (!userId || !notification) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: "Missing userId or notification" }));
        return;
      }

      const roomName = `user:${userId}`;
      console.log(
        `[NotificationService] HTTP push: notifying user ${userId}: "${notification.title}"`
      );

      // Emit to the user's room
      io.to(roomName).emit("new-notification", notification);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: true }));
    } catch (error) {
      console.error("[NotificationService] HTTP push error:", error);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ success: false, error: "Internal server error" }));
    }
  } else if (req.method === "GET" && req.url === "/health") {
    // Health endpoint: basic status for unauthenticated, detailed for authenticated
    const auth = verifyHttpAuth(req);

    res.writeHead(200, { "Content-Type": "application/json" });
    if (auth.authorized) {
      res.end(
        JSON.stringify({
          status: "ok",
          connections: userSocketsMap.size,
          users: Array.from(userSocketsMap.keys()),
        })
      );
    } else {
      res.end(JSON.stringify({ status: "ok" }));
    }
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

// Use a different port for HTTP to avoid conflicting with Socket.io
const HTTP_PORT = 3005;
httpServer.listen(HTTP_PORT, () => {
  console.log(`[NotificationService] HTTP push endpoint running on port ${HTTP_PORT}`);
});

console.log(`[NotificationService] Socket.io notification service running on port ${PORT}`);
