const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  allUsers,
} = require("../controllers/users.controller");
const { checkAuth } = require("../middlewares/auth.middleware");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(checkAuth, logoutUser);
router.route("/all").get(checkAuth, allUsers);

module.exports = router;
