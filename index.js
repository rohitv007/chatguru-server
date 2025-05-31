require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const asyncHandler = require("express-async-handler");
const connectDB = require("./config/connectDB");
const verifyJWT = require("./middlewares/auth.middleware");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { configureSocket } = require("./socket");
const PORT = process.env.PORT || 3000;

// Connect to MongoDB Database
connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// SERVER ROUTES
const userRoutes = require("./routes/users.routes");
const chatRoutes = require("./routes/chats.routes");
const messageRoutes = require("./routes/messages.routes");

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use("/api/v1/users", userRoutes);
app.use("/api/v1/chats", chatRoutes);
app.use("/api/v1/messages", messageRoutes);

app.get(
  "/api/v1/profile",
  verifyJWT,
  asyncHandler(async (req, res) => {
    const accessToken = req?.headers["authorization"].split(" ")[1];
    // console.log("PROFILE ACCESS\n", accessToken);
    const user = await req.user;

    return res.json({
      success: true,
      user,
      accessToken,
    });
  })
);

app.all("*", (req, res) =>
  res.status(404).send("Error 404! Please go to the correct page")
);

const server = createServer(app);
configureSocket(server);

mongoose.connection.once("open", () => {
  server.listen(PORT, () => console.log(`Chat app listening on port ${PORT}`));
});
