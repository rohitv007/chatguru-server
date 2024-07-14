const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  allUsers,
  renewAccessToken,
} = require("../controllers/users.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/renew-token").post(renewAccessToken);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/all").get(verifyJWT, allUsers);

module.exports = router;
