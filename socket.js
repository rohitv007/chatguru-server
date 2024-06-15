const server = createServer(app);
//  SOCKET code
const io = new Server(server, {
  cors: corsOptions,
});

io.on("connection", (socket) => {
  console.log("User Connected");
  console.log("ID =>", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
