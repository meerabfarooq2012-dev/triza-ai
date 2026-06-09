import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const PORT = 3003;

// ─── JWT Configuration ────────────────────────────────────────────────────
// Must match the JWT_SECRET used by the main Next.js app (auth-middleware.ts)
const JWT_SECRET = process.env.JWT_SECRET || "thiora-dev-secret-change-in-production";

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

// Track user-socket mapping: socketId -> userId
const socketUserMap = new Map<string, string>();

// Track which rooms each socket is in: socketId -> Set<conversationId>
const socketRoomsMap = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(
    `[ChatService] Socket connected: ${socket.id} (user: ${socket.data.user?.userId})`
  );

  // ─── Register User ────────────────────────────────────────────────
  socket.on("register-user", (data: { userId: string }) => {
    const { userId } = data;

    // Verify userId matches the authenticated user
    if (socket.data.user?.userId !== userId) {
      socket.emit("error", { message: "User ID mismatch" });
      return;
    }

    const roomName = `user:${userId}`;

    socketUserMap.set(socket.id, userId);
    socket.join(roomName);

    console.log(
      `[ChatService] User ${userId} registered (room: ${roomName})`
    );

    // Broadcast online presence to all conversations this user may be part of
    socket.broadcast.emit("user-joined", { userId });
  });

  // ─── Register User ────────────────────────────────────────────────
  socket.on(
    "register-user",
    (data: { userId: string }) => {
      const { userId } = data;
      const roomName = `user:${userId}`;

      socketUserMap.set(socket.id, userId);
      socket.join(roomName);

      console.log(
        `[ChatService] User ${userId} registered (room: ${roomName})`
      );

      // Broadcast online presence to all conversations this user may be part of
      socket.broadcast.emit("user-joined", { userId });
    }
  );

  // ─── Join Conversation ────────────────────────────────────────────
  socket.on(
    "join-conversation",
    (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      const roomName = `conv:${conversationId}`;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        socket.emit("error", { message: "User ID mismatch" });
        return;
      }

      // Track user mapping
      socketUserMap.set(socket.id, userId);

      // Track room membership
      if (!socketRoomsMap.has(socket.id)) {
        socketRoomsMap.set(socket.id, new Set());
      }
      socketRoomsMap.get(socket.id)!.add(conversationId);

      socket.join(roomName);
      console.log(
        `[ChatService] User ${userId} joined conversation ${conversationId} (room: ${roomName})`
      );

      // Notify others in the room
      socket.to(roomName).emit("user-joined", { conversationId, userId });
    }
  );

  // ─── Leave Conversation ───────────────────────────────────────────
  socket.on(
    "leave-conversation",
    (data: { conversationId: string }) => {
      const { conversationId } = data;
      const roomName = `conv:${conversationId}`;
      const userId = socketUserMap.get(socket.id);

      socket.leave(roomName);

      // Remove from tracking
      socketRoomsMap.get(socket.id)?.delete(conversationId);

      console.log(
        `[ChatService] User ${userId} left conversation ${conversationId}`
      );

      // Notify others in the room
      socket.to(roomName).emit("user-left", { conversationId, userId });
    }
  );

  // ─── Send Message ─────────────────────────────────────────────────
  socket.on(
    "send-message",
    (data: {
      conversationId: string;
      message: {
        id: string;
        senderId: string;
        receiverId: string;
        content: string;
        messageType: string;
        isRead: boolean;
        createdAt: string;
        sender?: { id: string; name: string; avatar: string | null };
      };
    }) => {
      const { conversationId, message } = data;
      const roomName = `conv:${conversationId}`;

      // Verify the sender matches the authenticated user
      if (socket.data.user?.userId !== message.senderId) {
        socket.emit("error", { message: "Sender ID mismatch" });
        return;
      }

      console.log(
        `[ChatService] Message in conversation ${conversationId} from user ${message.senderId}`
      );

      // Broadcast to everyone in the conversation room (including sender for confirmation)
      io.to(roomName).emit("new-message", message);
    }
  );

  // ─── Typing Indicator ─────────────────────────────────────────────
  socket.on(
    "typing",
    (data: { conversationId: string; userId: string; userName: string }) => {
      const { conversationId, userId, userName } = data;
      const roomName = `conv:${conversationId}`;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        return;
      }

      // Broadcast to others in the room (not back to sender)
      socket
        .to(roomName)
        .emit("user-typing", { conversationId, userId, userName });
    }
  );

  // ─── Stop Typing ──────────────────────────────────────────────────
  socket.on(
    "stop-typing",
    (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      const roomName = `conv:${conversationId}`;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        return;
      }

      // Broadcast to others in the room
      socket.to(roomName).emit("user-stop-typing", { conversationId, userId });
    }
  );

  // ─── Mark Read ────────────────────────────────────────────────────
  socket.on(
    "mark-read",
    (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      const roomName = `conv:${conversationId}`;

      // Verify userId matches the authenticated user
      if (socket.data.user?.userId !== userId) {
        return;
      }

      console.log(
        `[ChatService] User ${userId} marked messages as read in conversation ${conversationId}`
      );

      // Broadcast to others in the room
      socket.to(roomName).emit("messages-read", { conversationId, userId });
    }
  );

  // ─── Disconnect ───────────────────────────────────────────────────
  socket.on("disconnect", (reason) => {
    const userId = socketUserMap.get(socket.id);
    const rooms = socketRoomsMap.get(socket.id);

    if (rooms && rooms.size > 0) {
      // Leave all conversation rooms
      for (const conversationId of rooms) {
        const roomName = `conv:${conversationId}`;
        socket.leave(roomName);
        socket.to(roomName).emit("user-left", { conversationId, userId });
      }
    }

    // Cleanup tracking maps
    socketUserMap.delete(socket.id);
    socketRoomsMap.delete(socket.id);

    console.log(
      `[ChatService] Socket disconnected: ${socket.id} (user: ${userId ?? "unknown"}, reason: ${reason})`
    );
  });
});

console.log(`[ChatService] Socket.io chat service running on port ${PORT}`);
