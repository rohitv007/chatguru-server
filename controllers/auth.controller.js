const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const createToken = require("../helpers/createToken");
const UserModel = require("../models/user.model");

const MAX_AGE = 24 * 60 * 60; // 24 hours

// REGISTER USER - POST method
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, regPassword, user_type_id } = req.body;

  try {
    if (!username || !email || !regPassword) {
      return res
        .status(400)
        .json({ message: "Please provide all credentials" });
    }

    const existingUser = await UserModel.findOne({
      $or: [{ username }, { email }],
    });

    // console.log("checking existingUser in register ->", existingUser);

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists! Please use a new email" });
    }

    const hashedPassword = await bcrypt.hash(regPassword, 10);

    await UserModel.create({
      username,
      email,
      password: hashedPassword,
      user_type_id,
    });

    // const accessToken = createToken(
    //   newUser?._id,
    //   newUser?.username,
    //   newUser?.user_type_id || 0,
    //   MAX_AGE
    // );

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      // accessToken,
    });
  } catch (error) {
    console.log("Error from server -", error);
    res.status(400).json(error);
  }
});

// LOGIN USER - POST method
const loginUser = asyncHandler(async (req, res) => {
  const { userPayload, loginPassword } = req.body;

  if (!userPayload || !loginPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide all credentials",
    });
  }

  const existingUser = await UserModel.findOne({
    $or: [{ username: userPayload }, { email: userPayload }],
  });

  // console.log("checking existingUser in login ->", existingUser);

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: `User does not exist! Please create an account.`,
    });
  }

  try {
    const auth = await bcrypt.compare(loginPassword, existingUser.password);
    if (!auth) {
      return res.status(401).json({
        success: false,
        message: "Password mismatch! Please provide a correct password.",
      });
    }

    // create jwt token for login
    const accessToken = await createToken(
      existingUser?._id,
      existingUser?.username,
      existingUser?.user_type_id,
      MAX_AGE
    );

    res.cookie("tokenCookie", accessToken, {
      httpOnly: true,
      secure: true,
      maxAge: MAX_AGE * 1000, // unit - milliseconds
    });

    res.status(200).json({
      success: true,
      message: "Logged In Successfully!",
      accessToken,
    });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// LOGOUT USER - GET method
const logoutUser = asyncHandler(async (req, res) => {
  try {
    res.clearCookie("tokenCookie");
    res
      .status(200)
      .json({ success: true, message: "Logged Out Successfully!" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: true, message: "Internal Server Error" });
  }
});

module.exports = { registerUser, loginUser, logoutUser };
