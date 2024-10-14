import { io } from "./app";

// Namespaces in Socket.IO provide a way to create multiple communication channels within a single Socket.IO connection. Each namespace has its own set of event handlers and logic, allowing you to separate different parts of your application logically.

// Default Namespace (/): Every Socket.IO server has a default namespace (/). If you don't specify a namespace, the client connects to this default namespace.

// Custom Namespaces: You can create custom namespaces (e.g., /chat, /news, /admin) to handle different functionalities.

// Key Characteristics:

// Isolation: Events and data sent in one namespace are isolated from others.

// Modularity: Facilitates modular application design by separating concerns.

// Multiplexing: Multiple namespaces share the same underlying connection, reducing the number of connections needed.

// Namespaces: /chat, /news, /admin – representing different modules.
// Rooms within /chat: room1, room2, etc. – representing different chat rooms.

// ------------------------------------------------------------------------------------------------------------------------------------

// Define the structure of the user object
interface User {
  id: string;
  meg: string;
  // Add other user properties as needed
}

declare module "socket.io" {
  interface Socket {
    user?: User;
  }
}

// Chat Namespace '/chat'
const chatNamespace = io.of("/chat");

io.of("/chat").use((socket, next) => {
  console.log(`User ${socket.id} attempting to connect to /chat`);
  socket.user = { id: socket.id, meg: "middleware value da" };
  next();
});

chatNamespace.on("connection", (socket) => {
  console.log(
    `User connected to '/chat' namespace: ${socket.id} and message: ${socket.user?.meg}`
  );

  // Join a chat room
  socket.on("joinRoom", (room) => {
    socket.join(room);
    chatNamespace
      .to(room)
      .emit(
        "notification",
        `User ${socket.id} and message: ${socket.user?.meg} has joined room ${room}.`
      );
  });

  // Leave a chat room
  socket.on("leaveRoom", (room) => {
    socket.leave(room);
    chatNamespace
      .to(room)
      .emit(
        "notification",
        `User ${socket.id} and message: ${socket.user?.meg} has left room ${room}.`
      );
  });

  // Handle chat messages
  socket.on("chatMessage", ({ room, message }) => {
    const msgData = {
      sender: socket.id,
      message,
      timestamp: new Date(),
    };
    chatNamespace.to(room).emit("chatMessage", msgData);
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected from '/chat' namespace: ${socket.id}`);
    // Optionally, notify rooms about the disconnection
  });
});

// Admin Namespace '/admin'
const adminNamespace = io.of("/admin");

// Simple in-memory store for active users
let activeUsers: any = {};

adminNamespace.on("connection", (socket) => {
  console.log(`Admin connected: ${socket.id}`);

  // Handle admin requests to get active users
  socket.on("getActiveUsers", () => {
    socket.emit("activeUsers", activeUsers);
  });

  // Monitor connections in other namespaces
  io.of("/").on("connection", (socket) => {
    activeUsers[socket.id] = {
      namespace: "/",
      rooms: Array.from(socket.rooms),
    };
    adminNamespace.emit("updateActiveUsers", activeUsers);
  });

  io.of("/chat").on("connection", (socket) => {
    activeUsers[socket.id] = {
      namespace: "/chat",
      rooms: Array.from(socket.rooms),
    };
    adminNamespace.emit("updateActiveUsers", activeUsers);
  });

  socket.on("disconnect", () => {
    console.log(`Admin disconnected: ${socket.id}`);
  });
});

// Implement with socket.ts and manage seperate file!!!!
