require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const asyncHandler = require("express-async-handler");
const connectDB = require("./config/connectDB");
const { verifyJWT } = require("./middlewares/auth.middleware");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
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

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/message", messageRoutes);

app.get(
  "/api/v1/profile",
  verifyJWT,
  asyncHandler(async (req, res) => {
    // console.log("PROFILE ACCESS ✅");
    const accessToken = req?.headers["authorization"].split(" ")[1];
    // console.log(accessToken);
    const { _id, username, email } = await req.user;

    return res.json({
      success: true,
      accessToken,
      id: _id,
      username,
      email,
    });
  })
);

app.all("*", (req, res) =>
  res.status(404).send("Error 404! Please go to the correct page")
);

mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Chat app listening on port ${PORT}`));
});
