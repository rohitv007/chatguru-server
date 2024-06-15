const { Router } = require("express");
const { checkAuth } = require("../middleware/auth.middleware");
const { accessChat, fetchChats } = require("../controllers/chat.controller");

const router = Router();

router.route("/").post(checkAuth, accessChat).get(checkAuth, fetchChats);

module.exports = router;
