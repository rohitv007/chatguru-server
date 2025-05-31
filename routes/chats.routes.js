const { Router } = require("express");
const verifyJWT = require("../middlewares/auth.middleware");
const {
  accessChat,
  fetchChats,
  createGroup,
} = require("../controllers/chats.controller");

const router = Router();

router.use(verifyJWT);
router.route("/").post(accessChat).get(fetchChats);
router.route("/group").post(verifyJWT, createGroup);

module.exports = router;
