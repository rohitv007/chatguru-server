require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const asyncHandler = require("express-async-handler");
const connectDB = require("./config/connectDB");
const { checkAuth } = require("./middleware/auth.middleware");
const corsOptions = require("./config/corsOptions");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3000;
const userRoutes = require("./routes/user.routes");
const chatRoutes = require("./routes/chat.routes");
const messageRoutes = require("./routes/message.routes");

// Connect to MongoDB Database
connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get(
  "/profile",
  checkAuth,
  asyncHandler(async (req, res) => {
    // console.log("PROFILE ACCESS ✅");
    const accessToken = req.headers["authorization"].split(" ")[1];
    const { _id, username, email } = await req.user;
    res.json({
      success: true,
      accessToken,
      id: _id,
      username,
      email,
    });
  })
);

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

app.all("*", (req, res) =>
  res.status(404).send("Error 404! Please go to the correct page")
);

mongoose.connection.once("open", () => {
  app.listen(PORT, () => console.log(`Chat app listening on port ${PORT}`));
});
