const { Router } = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  allUsers,
  updateProfile,
  removeProfileImage,
  renewAccessToken,
} = require("../controllers/users.controller");
const { verifyJWT } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/multer.middleware");

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router
  .route("/profile")
  .patch(verifyJWT, upload.single("avatarImage"), updateProfile);
router.route("/profile-image").patch(verifyJWT, removeProfileImage);
router.route("/renew-token").post(renewAccessToken);
router.route("/logout").get(verifyJWT, logoutUser);
router.route("/all").get(verifyJWT, allUsers);

module.exports = router;
