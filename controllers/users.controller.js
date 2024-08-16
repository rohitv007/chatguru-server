const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const {
  accessCookieOptions,
  refreshCookieOptions,
} = require("../utils/CookieOptions");
const { getIO } = require("../socket");

//! GENERATE AUTH TOKENS FOR USER
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // store refreshToken in db as well
    user.refreshToken = refreshToken;

    // saves the updated user document and bypasses any schema validations before saving
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

//! @description     Register New User
//! @route           POST /api/v1/user/register
//! @access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, regPassword, user_type_id } = req.body;

  try {
    // if any element is blank, return error
    if ([username, email, regPassword].some((field) => field?.trim() === "")) {
      return res
        .status(400)
        .json({ message: "Please provide all credentials" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    // console.log("checking existingUser in register ->", existingUser);

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists! Please use a new email" });
    }

    const user = await User.create({
      username,
      email,
      password: regPassword,
      user_type_id,
    });

    const newUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!newUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while registering the user!" });
    }

    // console.log("register success");

    getIO().emit("userAdded", newUser);

    res.status(201).json({
      success: true,
      message: "Account Created Successfully!",
      user: newUser,
    });
  } catch (error) {
    console.log("Error from server -", error);
    res.status(400).json(error);
  }
});

//! @description     Login User
//! @route           POST /api/v1/user/login
//! @access          Public
const loginUser = asyncHandler(async (req, res) => {
  const { userPayload, loginPassword } = req.body;

  if (!userPayload || !loginPassword) {
    return res.status(400).json({
      success: false,
      message: "Please provide all credentials",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ username: userPayload }, { email: userPayload }],
  });

  // console.log("checking user in login ->", existingUser);

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: "User does not exist! Please create an account.",
    });
  }

  try {
    const isPasswordValid = await existingUser.isPasswordMatch(loginPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid user credentials",
      });
    }
    // generate tokens for login route
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      existingUser._id
    );

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password -refreshToken"
    );

    if (!loggedInUser) {
      return res.status(500).json({
        success: false,
        message: "Something went wrong while trying to login!",
      });
    }

    // console.log("login success");

    res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", refreshToken, refreshCookieOptions)
      .json({
        success: true,
        message: "Logged In Successfully!",
        user: loggedInUser,
        accessToken,
      });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

//! @description     Logout User
//! @route           GET /api/v1/user/logout
//! @access          Protected
const logoutUser = asyncHandler(async (req, res) => {
  // console.log("USER =>", req?.user);

  try {
    // Remove the refreshToken field from the user's document
    await User.findByIdAndUpdate(
      req.user._id,
      {
        $unset: { refreshToken: 1 },
      },
      {
        new: true,
      }
    );

    res
      .status(200)
      .clearCookie("accessToken", accessCookieOptions)
      .clearCookie("refreshToken", refreshCookieOptions)
      .json({ success: true, message: "Logged Out Successfully!" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: true, message: "Internal Server Error" });
  }
});

//! @description     Renew Access Token
//! @route           POST /api/v1/user/renew-token
//! @access          Public/Protected
const renewAccessToken = asyncHandler(async (req, res) => {
  // console.log(req.cookies);
  // console.log(req.body);
  const existingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!existingRefreshToken) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized Request",
    });
  }

  try {
    const decodedToken = jwt.verify(
      existingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid Refresh Token",
      });
    }

    if (existingRefreshToken !== user?.refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh Token is expired or used!",
      });
    }

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .json({
        success: true,
        message: "Access Token renewed",
        accessToken,
        refreshToken: newRefreshToken,
      });
  } catch (error) {
    res.status(401).send({
      success: false,
      message: error?.message || "Invalid refresh token",
    });
  }
});

//! @description     List of all Users
//! @route           GET /api/v1/user/all
//! @access          Protected
const allUsers = asyncHandler(async (req, res) => {
  try {
    // console.log('USER ->', req?.user);

    const allUsers = await User.find({
      _id: { $ne: req.user?._id },
    }).select("-password -refreshToken");

    // console.log(allUsers);
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: true, message: "Internal Server Error" });
  }
});

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  renewAccessToken,
  allUsers,
};
