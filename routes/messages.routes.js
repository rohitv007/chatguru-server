const { Router } = require("express");
const verifyJWT = require("../middlewares/auth.middleware");
const {
  fetchMessages,
  sendMessage,
} = require("../controllers/messages.controller");

const router = Router();

router.use(verifyJWT);
router.route("/:chatId").get(fetchMessages);
router.route("/").post(sendMessage);

module.exports = router;
