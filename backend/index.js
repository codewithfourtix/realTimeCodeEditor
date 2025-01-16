import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
const room = new Map();

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentUser = null;

  socket.on("join", (roomId, userName) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      room.get(currentRoom).delete(currentUser);
      io.to(currentRoom).emit("userJoined", Array.from(room.get(currentRoom)));
    }
    currentRoom = roomId;
    currentUser = userName;

    socket.join(roomId);

    if (!room.has(roomId)) {
      room.set(roomId, new Set());
    }

    room.get(roomId).add(userName);

    io.to(roomId).emit("userJoined", Array.from(room.get(roomId)));

    socket.on("codeChange", (roomId, code) => {
      socket.to(roomId).emit("codeUpdate", code);
    });

    socket.on("leaveRoom", () => {
      if (currentUser && currentRoom) {
        room.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(room.get(roomId)));

        socket.leave(currentRoom);

        currentRoom = null;
        currentUser = null;
      }
    });

    socket.on("typing", ({ roomId, userName }) => {
      socket.to(roomId).emit("userTyping", userName);
    });

    socket.on("languageChange", ({ roomId, language }) => {
      io.to(roomId).emit("languageUpdate", language);
    });

    socket.on("disconnect", () => {
      if (currentUser && currentRoom) {
        room.get(currentRoom).delete(currentUser);
        io.to(currentRoom).emit("userJoined", Array.from(room.get(roomId)));
      }
      console.log("User Disconnected");
    });
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
