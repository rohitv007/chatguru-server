const { Router } = require("express");
const { verifyJWT } = require("../middlewares/auth.middleware");
const { accessChat, fetchChats } = require("../controllers/chats.controller");

const router = Router();

router.use(verifyJWT);
router.route("/").post(accessChat).get(fetchChats);

module.exports = router;
