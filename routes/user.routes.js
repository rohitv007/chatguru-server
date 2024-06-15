const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  allUsers,
} = require("../controllers/user.controller");
const { checkAuth } = require("../middleware/auth.middleware");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
router.route("/all").get(checkAuth, allUsers);

module.exports = router;
