const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const {
  accessCookieOptions,
  refreshCookieOptions,
} = require("../utils/CookieOptions");
const { getIO } = require("../socket");
const { formatValidationErrors } = require("../helpers/formatValidationErrors");
const uploadFileToCloudinary = require("../utils/cloudinary");

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
//! @route           POST /api/v1/users/register
//! @access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // if any element is blank, return error
    if ([username, email, password].some((field) => field?.trim() === "")) {
      return res
        .status(400)
        .json({ message: "Please provide all required credentials" });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    // console.log("checking existingUser in register ->", existingUser);

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists! Please use a different username or email",
      });
    }

    const user = await User.create({
      username,
      email,
      password,
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
      message:
        "Account created successfully!\nPlease login to experience ChatGuru",
      user: newUser,
    });
  } catch (error) {
    // console.log(error);
    if (error.name === "ValidationError") {
      const formattedErrors = formatValidationErrors(error.errors);
      // console.log(formattedErrors);
      res.status(400).json({ success: false, errors: formattedErrors });
    } else {
      res.status(500).json({ success: false, message: "Server error" });
    }
  }
});

//! @description     Login User
//! @route           POST /api/v1/users/login
//! @access          Public
const loginUser = asyncHandler(async (req, res) => {
  const { userInput, password } = req.body;

  if (!userInput || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required credentials",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ username: userInput }, { email: userInput }],
  });

  // console.log("checking user in login ->", existingUser);

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: "User not found! Please create an account to continue.",
    });
  }

  try {
    const isPasswordValid = await existingUser.isPasswordMatch(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid credentials! Please check your username/email and password.",
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
//! @route           GET /api/v1/users/logout
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
//! @route           POST /api/v1/users/renew-token
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

//! @description     Update user => username/image
//! @route           PATCH /api/v1/users/profile
//! @access          Protected
const updateProfile = asyncHandler(async (req, res) => {
  const userId = req?.user.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Request" });
  }

  const localFilePath = req.file?.path;
  const avatarImage = await uploadFileToCloudinary(localFilePath, "image");

  try {
    const currUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          username: req.body?.username,
          avatarImage: avatarImage?.url,
        },
      },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res
      .status(200)
      .json({ success: true, message: "user updated", user: currUser });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

//! @description     Remove Profile Image
//! @route           PATCH /api/v1/users/profile-image
//! @access          Protected
const removeProfileImage = asyncHandler(async (req, res) => {
  const userId = req?.user.id;

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized Request" });
  }

  try {
    const currUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          avatarImage: "",
        },
      },
      { new: true, runValidators: true }
    ).select("-password -refreshToken");

    res.status(200).json({
      success: true,
      message: "profile image removed",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
});

//! @description     List of all Users
//! @route           GET /api/v1/users/all
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
  updateProfile,
  removeProfileImage,
  renewAccessToken,
  allUsers,
};
