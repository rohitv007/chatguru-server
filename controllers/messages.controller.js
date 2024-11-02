const asyncHandler = require("express-async-handler");
const Message = require("../models/messages.model");
const User = require("../models/users.model");
const Chat = require("../models/chats.model");

//! @description     Fetch all messages of inside a chat
//! @route           GET /api/v1/messages/:chatId
//! @access          Protected
const fetchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  // console.log(chatId);

  try {
    const messageData = await Message.find({ chat: chatId })
      .populate("sender", "username email avatarImage")
      .populate("chat");
    // console.log("EXISTING\n", messageData);

    res.status(200).send(messageData);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//! @description     Send New Message
//! @route           POST /api/v1/messages
//! @access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  console.log("sending new message", req.body);
  const { chatId, content, file } = req.body;

  if (!chatId || !content) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    let messageDoc = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId,
    });

    messageDoc = (
      await messageDoc.populate("sender", "username avatarImage")
    ).populate("chat");

    messageDoc = await User.populate(messageDoc, {
      path: "chat.users",
      select: "username email avatarImage",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: messageDoc,
    });

    // console.log("NEW\n", messageDoc);

    res.status(200).send(messageDoc);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { fetchMessages, sendMessage };
