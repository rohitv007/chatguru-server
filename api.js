const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const asyncHandler = require("express-async-handler");
const path = require("path");
const authRouter = require("./routes/auth.router");
const connectDB = require("./config/connectDB");
const { checkUser } = require("./middleware/auth.middleware");
const webSocketConn = require("./newSocketConn");
const MessageModel = require("./models/message.model");
const UserModel = require("./models/user.model");
const corsOptions = require("./config/corsOptions");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../client/dist")));

app.get(
  "/profile",
  checkUser,
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

// GET messages between a particular sender & recipient
app.get(
  "/messages/:userId",
  checkUser,
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    // console.log(userId);
    const { _id: ourId } = await req.user;
    // console.log(ourId);

    const messageData = await MessageModel.find({
      sender: { $in: [userId, ourId] },
      recipient: { $in: [userId, ourId] },
    }).sort({ createdAt: 1 });

    // console.log("Data from MessageModel\n", messageData);
    res.status(200).json(messageData);
  })
);

app.get("/people", async (req, res) => {
  const users = await UserModel.find({}, { _id: 1, username: 1 });
  res.json(users);
});

app.get("/", (req, res) => {
  res.send("Home Page");
});

app.use(authRouter);

// app.all("*", (req, res) =>
//   res.status(404).send("Error 404! Please go to the correct page")
// );

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/dist", "index.html"));
});

const server = app.listen(PORT, () =>
  console.log(`Chat app listening on port ${PORT}`)
);

// websocket connection
webSocketConn(server);
