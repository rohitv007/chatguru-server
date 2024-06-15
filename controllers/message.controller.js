const asyncHandler = require("express-async-handler");
const Message = require("../models/MessageModel");
const User = require("../models/UserModel");
const Chat = require("../models/ChatModel");

//@description     Fetch all messages of inside a chat
//@route           GET /api/message/:chatId
//@access          Protected
const fetchMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  // console.log(chatId);

  try {
    const messageData = await Message.find({ chat: chatId })
      .populate("sender", "username email pic")
      .populate("chat");
    // console.log("EXISTING\n", messageData);

    res.status(200).send(messageData);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

//@description     Send New Message
//@route           POST /api/message
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  console.log("sending new message");
  const { chatId, text } = req.body;

  if (!chatId || !text) {
    console.log("Invalid data passed into request");
    return res.sendStatus(400);
  }

  try {
    let messageDoc = await Message.create({
      sender: req.user._id,
      text,
      chat: chatId,
    });

    messageDoc = (await messageDoc.populate("sender", "username pic")).populate(
      "chat"
    );

    messageDoc = await User.populate(messageDoc, {
      path: "chat.users",
      select: "username email pic",
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
