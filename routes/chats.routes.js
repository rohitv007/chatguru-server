const { Router } = require("express");
const { checkAuth } = require("../middlewares/auth.middleware");
const { accessChat, fetchChats } = require("../controllers/chats.controller");

const router = Router();

router.route("/").post(checkAuth, accessChat).get(checkAuth, fetchChats);

module.exports = router;
