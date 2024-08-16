const asyncHandler = require("express-async-handler");
const Chat = require("../models/chats.model");
const User = require("../models/users.model");

//@description     Create a new chat/access existing chat
//@route           POST /api/v1/chat
//@access          Protected
const accessChat = asyncHandler(async (req, res) => {
  // console.log(req.body);
  const { userId } = req.body;
  const user = await User.findById(userId);
  // console.log(user);

  if (!user) {
    console.log("Incorrect or Missing User");
    return res.status(400).send("Incorrect or Missing user");
  }

  // IF CHAT ALREADY EXISTS
  let currChat = await Chat.find({
    isGroup: false,
    users: {
      $all: [userId, req.user._id],
    },
  })
    .populate("users", "-password") // populating Chat with given values inside 'users' array, where ref is UserModel
    .populate("latestMessage"); // populating Chat with latestMessage, where ref is MessageModel

  // populating latestMessage object with sender details (under 'select')
  currChat = await User.populate(currChat, {
    path: "latestMessage.sender",
    select: "username email pic",
  });

  // console.log('EXISTING CHAT =>\n', currChat[0]);

  if (currChat.length > 0) return res.status(200).json(currChat[0]);

  // CREATE NEW CHAT
  try {
    const newChat = await Chat.create({
      chatName: "sender",
      isGroup: false,
      users: [userId, req.user._id],
    });

    const chatDoc = await Chat.populate(newChat, {
      path: "users",
      select: "-password",
    });

    res.status(200).json(chatDoc);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Fetch all chats for a user
//@route           GET /api/v1/chat
//@access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    let allChats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    allChats = await User.populate(allChats, {
      path: "latestMessage.sender",
      select: "username email pic",
    });

    // console.log("ALL CHATS\n", allChats);
    res.status(200).send(allChats);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { accessChat, fetchChats };
