const asyncHandler = require("express-async-handler");
const Chat = require("../models/chats.model");
const User = require("../models/users.model");

//! @description     Create a new chat/access existing chat
//! @route           POST /api/v1/chats
//! @access          Protected
const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const user = await User.findById(userId);

  if (!user) {
    console.log("Incorrect or Missing User");
    return res.status(400).send("Incorrect or Missing user");
  }

  // IF CHAT ALREADY EXISTS
  const existingChat = await Chat.findOne({
    isGroup: false,
    users: {
      $all: [userId, req.user._id],
    },
  });

  if (existingChat) {
    const populatedChat = await Chat.populate(existingChat, {
      path: "users",
      select: "-password",
    });

    const populatedLatestMessage = await User.populate(populatedChat, {
      path: "latestMessage.sender",
      select: "username email avatarImage",
    });

    console.log("EXISTING CHAT =>\n", populatedLatestMessage);

    return res.status(200).json(populatedLatestMessage);
  }

  // CREATE NEW CHAT
  try {
    const newChat = await Chat.create({
      chatName: "sender",
      isGroup: false,
      users: [userId, req.user._id],
    });

    const populatedNewChat = await Chat.populate(newChat, {
      path: "users",
      select: "-password",
    });

    console.log("NEW CHAT =>", populatedNewChat);

    res.status(201).json(populatedNewChat);
  } catch (error) {
    console.log("Error creating new chat\n", error);
    res.status(400);
    throw new Error(error.message);
  }
});

//! @description     Fetch all chats for a user
//! @route           GET /api/v1/chats
//! @access          Protected
const fetchChats = asyncHandler(async (req, res) => {
  try {
    const chatQuery = {
      users: { $elemMatch: { $eq: req.user._id } },
    };

    const allChats = await Chat.find(chatQuery)
      .populate("users", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    const populatedChats = await User.populate(allChats, {
      path: "latestMessage.sender",
      select: "username email avatarImage",
    });

    console.log("ALL CHATS\n", populatedChats);

    res.status(200).send(populatedChats);
  } catch (error) {
    console.log("Error fetching chats\n", error);
    res.status(400);
    throw new Error(error.message);
  }
});

//! @description     Create a new group chat/access existing group
//! @route           POST /api/v1/chats/group
//! @access          Protected
const createGroup = asyncHandler(async (req, res) => {
  const { chatName, userIds } = req.body;

  try {
    const existingGroup = await Chat.findOne({
      isGroup: true,
      chatName,
      users: { $in: [...userIds, req.user._id] },
    });

    if (existingGroup) {
      console.log("Existing Group");
      return res.status(200).json(existingGroup);
    }

    const newGroup = await Chat.create({
      chatName,
      isGroup: true,
      users: [...userIds, req.user._id],
      groupAdmin: req.user._id,
    });

    console.log("new group created successfully");

    res.status(201).json({
      success: true,
      message: "Group created successfully",
      newGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create group",
    });
  }
});

module.exports = { accessChat, fetchChats, createGroup };
