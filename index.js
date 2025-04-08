import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Server } from "socket.io";
import { Filter } from "bad-words";
import { addUser } from "./utils/users.js";

const app = express();
const server = createServer(app);
const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDirectoryPath = join(__dirname, "./public");

app.use(express.static(publicDirectoryPath));
/**
/**
 * ========== Socket.IO Basics ==========
 *
 * io.on("connection", socket => { ... })
 * - Triggered when a new client connects to the default namespace "/"
 * - Provides a unique 'socket' object for that specific client
 *
 * socket.id
 * - A unique identifier assigned to each connected client
 * - Useful for tracking and identifying users
 *
 * socket.on(event, callback)
 * - Listens for a specific event from this particular client
 * - You define what to do when the event is received
 *
 * socket.emit(event, data)
 * - Sends a message ONLY to the connected client (private message)
 * - Useful for confirmations, personal data, or private responses
 *
 * io.emit(event, data)
 * - Broadcasts a message to ALL connected clients (including the sender)
 * - Useful for chat messages, notifications, etc.
 *
 * socket.broadcast.emit(event, data)
 * - Sends a message to all connected clients EXCEPT the sender
 * - Helpful for alerting others without echoing back to the sender
 *
 * ========= Acknowledgement Pattern =========
 *
 * Acknowledgements allow the sender to get a response from the receiver
 * socket.on("event", (data, ack) => {
 *    ack("✅ Received!");
 * });
 *
 * This works like WhatsApp's double-check marks — confirms the message was received.
 *
 * ========= Rooms =========
 *
 * Rooms are **server-side channels** that clients can join or leave. Useful for targeting
 * a subset of users — like a specific chat room, project, post, or game room.
 *
 * socket.join(roomName)
 * - Adds this client to a specific "room"
 * - You can think of it like adding the socket to a group
 *
 * socket.leave(roomName)
 * - Removes the client from a room
 *
 * io.to(roomName).emit(event, data)
 * - Sends a message to **ALL clients in that room**
 *
 * socket.to(roomName).emit(event, data)
 * - Sends a message to all clients in the room EXCEPT the sender
 *
 * io.to("room1").to("room2").emit(...)
 * - Emits to multiple rooms at once (clients in ANY of the rooms receive the event)
 *
 * io.except("roomName").emit(...)
 * - Emits to all clients EXCEPT those in the specified room
 *
 * Example use case:
 * -----------------
 * // On connection, join the room based on post ID
 * socket.on("joinPost", (postId) => {
 *   socket.join(`post:${postId}`);
 * });
 *
 * // Broadcast a new comment to everyone viewing the post (except the sender)
 * socket.on("newComment", ({ postId, comment }) => {
 *   socket.to(`post:${postId}`).emit("receiveComment", comment);
 * });
 *
 * Notes:
 * - The client does NOT know which rooms it's in (rooms are server-side only)
 * - On disconnection, the socket automatically leaves all rooms
 *
 * Debugging:
 * socket.on("disconnecting", () => {
 *   console.log(socket.rooms); // Set of rooms including the socket ID
 * });
 *
 * ========= Namespaces =========
 *
 * Namespaces allow you to split the communication into multiple channels
 * within the same server — useful for roles like admin, support, etc.
 *
 * Server-side example:
 * --------------------
 * io.of("/admin").on("connection", (socket) => {
 *   // Namespace for admin clients
 *   console.log("✅ Admin connected:", socket.id);
 * });
 *
 * io.of("/support").on("connection", (socket) => {
 *   // Namespace for support team
 *   console.log("🛠️ Support agent connected:", socket.id);
 * });
 *
 * Client-side example:
 * --------------------
 * const adminSocket = io("/admin");
 * const supportSocket = io("/support");
 *
 * - Each socket will only receive messages sent within its namespace
 * - This separation avoids confusion between user types or services
 */

io.on("connection", (socket) => {
  socket.broadcast.emit("message", {
    text: "A new user has joined!",
    createdAt: new Date().getTime(),
  });

  //join
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) {
      return callback(error);
    }
    socket.join(room);
    socket.broadcast.to(room).emit("message", {
      text: `${name} has joined the room!`,
      createdAt: new Date().getTime(),
    });
  });

  socket.on("sendMessage", (message, callback) => {
    //check for bad words
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("🚫 Profanity is not allowed!");
    }
    // Emit the message to all connected clients
    io.emit("message", {
      text: message,
      createdAt: new Date().getTime(),
    });
    callback("✅ Message delivered to everyone!");
  });
  socket.on("disconnect", () => {
    socket.broadcast.emit("message", "A user has left!");
  });
});
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
