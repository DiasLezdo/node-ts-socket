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
const io = new Server(httpServer, {
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
  console.log("headers", headers);
});

io.on("connection", (socket) => {
  console.log("user connected");

  const count = io.engine.clientsCount;
  const count2 = io.of("/").sockets.size;

  console.log("count", count);
  console.log("count2", count2);

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

  // disconnect

  socket.on("disconnect", function () {
    console.log("user disconnected");
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
