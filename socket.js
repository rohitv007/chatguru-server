const { Server } = require("socket.io");
const corsOptions = require("./config/corsOptions");

//  SOCKET code
const configureSocket = (server) => {
  const io = new Server(server, {
    cors: corsOptions,
    pingTimeout: 60 * 1000      // 60 seconds
  });

  io.on("connection", (socket) => {
    console.log("User Connected");
    console.log("ID =>", socket.id);

    socket.on("sendMessage", (message) => {
      console.log('New Message =>', message);
      io.emit("newMessage", message);
    });

    socket.on("accessUserChat", (data) => {
      console.log("HERE =>", data);
      io.emit('allChats', )
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
};

module.exports = configureSocket;
