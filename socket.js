const { Server } = require("socket.io");
const corsOptions = require("./config/corsOptions");
const { fetchChats } = require("./controllers/chats.controller");

//  SOCKET code
let io;

const configureSocket = (server) => {
  io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60 * 1000, // 60 seconds
  });

  io.on("connection", (socket) => {
    console.log("User Connected");
    console.log("Socket ID =>", socket.id);

    socket.on("sendMessage", (message) => {
      console.log("New Message =>", message.content);
      io.emit("newMessage", message);
    });

    socket.on("join chat", (room) => {
      socket.join(room);
      console.log("User Joined Room:", room);
      io.emit("chat accessed", room);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized");
  }
  return io;
};

module.exports = { configureSocket, getIO };
