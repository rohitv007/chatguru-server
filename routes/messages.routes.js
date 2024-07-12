const { Router } = require("express");
const { fetchMessages, sendMessage } = require("../controllers/messages.controller");
const { checkAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.route("/:chatId").get(checkAuth, fetchMessages);
router.route("/").post(checkAuth, sendMessage);

module.exports = router