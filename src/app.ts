// Import the 'express' module
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

// Create an Express application
const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Set the port number for the server
const port = 5000;

const httpServer = createServer(app);
export const io = new Server(httpServer, {
  /* options */
  cors: {
    origin: "http://localhost:5173",
    allowedHeaders: ["odu-header"],
    credentials: true,
  },
});

// Define a route for the root path ('/')
app.get("/", (req, res) => {
  // Send a response to the client
  res.send("Hello, TypeScript + Node.js + Express!");
});

io.engine.on("initial_headers", (headers, req) => {
  headers["hhhhh"] = "123";
  headers["set-cookie"] = "mycookie=456";
  // console.log("headers", headers);
});

io.on("connection", (socket) => {
  console.log("user connected");

  // const count = io.engine.clientsCount;
  // const count2 = io.of("/").sockets.size;

  // console.log("count", count);
  // console.log("count2", count2);

  // emit event

  socket.emit("message", {
    message: "Welcome to the chat!",
    timestamp: Date.now(),
  });

  socket.on("ping", (count) => {
    console.log(count);
  });

  // MULTI SERVER SOCKET

  // // server A
  // io.serverSideEmit("ping", (err: Error, responses: any) => {
  //   if (err) {
  //     console.error("Error on server side emit:", err.message);
  //     return;
  //   }
  //   console.log(responses[0]); // prints "pong"
  // });

  // // server B
  // io.on("ping", (cb) => {
  //   cb("pong");
  // });

  // callback socket
  socket.on("callback-socket", (arg1, arg2, callback) => {
    console.log(arg1); // 1
    console.log(arg2); // { name: "updated" }
    callback({
      status: "ok",
      data: {
        1: arg1,
        2: arg2,
      },
      message: "response successfully sent",
    });
  });

  // timeout

  socket.on("timeout-11", (data, callback) => {
    try {
      console.log("Received 'timeout-11' with data:", data);

      // Simulate processing time based on 'delay' from client or default to 3 seconds
      const processingTime = data.delay || 3000; // in milliseconds

      setTimeout(() => {
        const dt = {
          status: "99",
        };

        // Send acknowledgment back to the client //
        callback(dt); //documentation callback(null,dt) ---> not working
        console.log(
          "Acknowledgment sent after",
          processingTime,
          "ms with data:",
          dt
        );
      }, processingTime);
    } catch (error) {
      console.log("error", error);
      // Optionally, send error back to client
      callback(error, null);
    }
  });

  // -------------------------------------------------------------------------------------

  // countVolatileEvent

  // Volatile events are a special type of event in Socket.IO designed for scenarios where it's acceptable for messages to be lost if the connection isn't ready.
  // They operate similarly to the UDP protocol in networking, which prioritizes speed over reliability. This means:

  // No Buffering: If the client isn't ready to receive a volatile event (e.g., due to a temporary network issue), the event won't be queued or retried. It's simply discarded.

  // Latest Data Priority: In situations where only the most recent data is relevant (like real-time position updates in a game),
  // volatile events ensure that outdated information doesn't clutter the network or the client.

  // let countVolatileEvent: number = 0;
  // setInterval(() => {
  //   socket.volatile.emit("ping", ++countVolatileEvent);
  // }, 1000);

  // ----------------------------------------------------------------

  // ONCE

  // Initialization: You might want to perform some initialization tasks once you receive certain data from the server.

  // Authentication: Waiting for a single authentication response before proceeding.

  // Single Updates: Listening for a one-time update or notification.

  // Emit 'once-method' event to the client

  socket.emit("once-method");

  // Listen for 'details_once' event only once
  socket.once("details_once", ({ userId, userName }) => {
    console.log(`User ID: ${userId}, User Name: ${userName}`);
  });

  // -------------------------------------------------------------------------------------

  // Socket Off

  socket.on("btn-on", (response, cb) => {
    console.log(response);
    cb(null, { status: "ok", message: "button clicked" });
  });

  // ----------------------------------------------------

  // PREPEND

  // socket.prependAny(listener) is designed to add a universal listener that gets triggered whenever any event is emitted on the socket.

  // This listener is prepended to the beginning of the listeners array, ensuring it runs before any other event-specific listeners.

  socket.prependAny((eventName, ...args) => {
    console.log(`Received event: '${eventName}' with data:`, args);
    // You can add global logic here, e.g., authentication, logging, etc.
  });

  // --------------------------------------------------------

  // broadcast

  socket.on("broad_cast_trigger", (response: any, cb) => {
    console.log(response);
    cb(null, { status: "ok", message: "button clicked" });

    socket.broadcast.emit("documentUpdated", {
      hh: "bordcaset",
      message: "hi tailiz",
    });
  });

  // ------------------------------------------------

  // ROOMs

  //Absolutely! Rooms in Socket.IO are a powerful feature that allows you to group sockets into arbitrary channels. This facilitates targeted communication by enabling the server to broadcast events to a specific subset of connected clients rather than broadcasting to all clients indiscriminately.

  // What Are Rooms in Socket.IO?
  // A room is simply a named channel that sockets can join and leave. Rooms are server-side only and are used to manage groups of sockets for more organized and efficient event broadcasting.

  // Arbitrary Grouping: Rooms can be created dynamically and are not restricted to any predefined list. This flexibility allows for various use cases, such as chat rooms, game lobbies, or project-specific updates.
  // No Explicit Creation: Rooms are created implicitly when a socket joins them and are deleted automatically when all sockets leave.

  // Why Use Rooms?
  // Using rooms allows you to:-

  // Targeted Broadcasting: Send events to specific groups of clients without affecting others.
  // Organized Communication: Manage different channels of communication within your application seamlessly.
  // Scalability: Efficiently handle large numbers of clients by segmenting them into manageable groups.

  // Basic Operations with Rooms:-

  // Joining a Room:
  // A socket can join a room using the join method.

  // Leaving a Room:
  // A socket can leave a room using the leave method.

  // Broadcasting to a Room:
  // Emit events to all sockets within a specific room.

  // Listing Rooms:
  // Retrieve information about existing rooms and the sockets within them.

  // Listen for a joinRoom event from the client
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`Socket ${socket.id} joined room ${roomName}`);

    // Optionally, notify others in the room
    socket
      .to(roomName)
      .emit("notification", `User ${socket.id} has joined the room.`);
  });

  socket.on("leaveRoom", (roomName) => {
    socket.leave(roomName);
    console.log(`Socket ${socket.id} left room ${roomName}`);

    // Optionally, notify others in the room
    socket
      .to(roomName)
      .emit("notification", `User ${socket.id} has left the room.`);
  });

  socket.on("room_message", ({ roomName, message }) => {
    // Broadcast the message to all sockets in the specified room
    io.to(roomName).emit("recieve_room_message", {
      sender: socket.id,
      message: message,
    });
  });

  // list rooms

  type RoomInfo = {
    room: string;
    size: number;
  };

  socket.on("getRooms", () => {
    const rooms = io.sockets.adapter.rooms;
    const roomsInfo: RoomInfo[] = [];

    rooms.forEach((sockets, room) => {
      // Exclude rooms that are individual socket IDs
      if (!sockets.has(room)) {
        roomsInfo.push({ room, size: sockets.size });
      }
    });

    socket.emit("roomsList", roomsInfo);
  });

  // Endpoint to get sockets in a specific room
  socket.on("getSocketsInRoom", (roomName) => {
    const socketsInRoom = io.sockets.adapter.rooms.get(roomName);

    if (socketsInRoom) {
      socket.emit("socketsInRoom", Array.from(socketsInRoom));
    } else {
      socket.emit("socketsInRoom", []);
    }
  });

  // ---------------------------------------------------
  // disconnect

  socket.on("disconnect", function () {
    console.log("user disconnected");
  });
});

// ------------------------------------------------------------------------------------------------

// NAMESPACE

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

  socket.emit(
    "welcome",
    { message: socket.user?.meg },
    (err: Error, response: any) => {
      // Removed TypeScript annotations
      if (err) {
        console.log("err", err);
      } else {
        console.log("response", response);
        console.log("status", response.status); // Access 'status' directly
      }
      // Disconnect after handling the response
      // socket.disconnect(); //if want
    }
  );

  socket.on("disconnect", () => {
    console.log(`User disconnected from '/chat' namespace: ${socket.id}`);
    // Optionally, notify rooms about the disconnection
  });
});

io.engine.on("connection_error", (err) => {
  console.log(err.req); // the request object
  console.log(err.code); // the error code, for example 1
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

// Start the server using httpServer instead of app
httpServer.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// --------------------------- @ @ @ @ ------------------------------------

// steps --> based our implementation

// npm run build ---> build our project and change or compile to js

// npm start -->dist/app.js
