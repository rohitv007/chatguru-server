const { Router } = require("express");
const { fetchMessages, sendMessage } = require("../controllers/message.controller");
const { checkAuth } = require("../middleware/auth.middleware");

const router = Router();

router.route("/:chatId").get(checkAuth, fetchMessages);
router.route("/").post(checkAuth, sendMessage);

module.exports = router