require("dotenv").config();
const express = require("express");
const { createServer } = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);
const publicDirectoryPath = path.join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));
/**
 * io.on("connection") is fired when a new client connects to the server.
 * It gives you access to a unique 'socket' object for that specific client.
 *
 * socket.id is a unique identifier assigned automatically to each connected client.
 * You can use this ID to track or identify the user.
 *
 * io.emit(event, data) is used to send a message to all connected clients — including the one that sent the event.
 * This is useful for broadcasting updates like chat messages, notifications, etc.
 *
 * socket.emit(event, data) is used to send a message to only the connected client (the one represented by this socket).
 * This is useful for sending a private message, confirmation, or response to one user only.
 *
 * socket.on(event, callback) is used to listen for events from that specific client.
 * You define the event name and what to do when it's received .
 */

let count = 0;
io.on("connection", (socket) => {
  console.log("🟢 A user connected:", socket.id);
  socket.emit("countUpdated", count);
  socket.on("increment", () => {
    // Increase the counter
    count++;

    // Send the updated count to ALL connected clients
    io.emit("countUpdated", count);

    // 👇 لو كنت عايز تبعت التحديث للعميل الحالي فقط:
    // socket.emit("countUpdated", count);
  });
  socket.on("decrement", () => {
    count--;
    io.emit("countUpdated", count);
  });
  socket.on("reset", () => {
    count = 0;
    io.emit("countUpdated", count);
  });
});

const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
