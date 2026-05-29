import { Server } from "socket.io";

const PORT = 3003;

const io = new Server(PORT, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Track user-socket mapping: socketId -> userId
const socketUserMap = new Map<string, string>();

// Track which rooms each socket is in: socketId -> Set<conversationId>
const socketRoomsMap = new Map<string, Set<string>>();

io.on("connection", (socket) => {
  console.log(`[ChatService] Socket connected: ${socket.id}`);

  // ─── Join Conversation ────────────────────────────────────────────
  socket.on(
    "join-conversation",
    (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      const roomName = `conv:${conversationId}`;

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

      // Broadcast to others in the room (not back to sender)
      socket.to(roomName).emit("user-typing", { conversationId, userId, userName });
    }
  );

  // ─── Stop Typing ──────────────────────────────────────────────────
  socket.on(
    "stop-typing",
    (data: { conversationId: string; userId: string }) => {
      const { conversationId, userId } = data;
      const roomName = `conv:${conversationId}`;

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
