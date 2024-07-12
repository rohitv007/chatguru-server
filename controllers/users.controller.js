const asyncHandler = require("express-async-handler");
const User = require("../models/users.model");

const MAX_AGE = 24 * 60 * 60; // 24 hours

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    // saves the updated user document and bypasses any schema validations before saving

    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// REGISTER USER - POST method
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

// LOGIN USER - POST method
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

  // console.log("checking existingUser in login ->", existingUser);

  if (!existingUser) {
    return res.status(404).json({
      success: false,
      message: `User does not exist! Please create an account.`,
    });
  }

  try {
    const isPasswordValid = await existingUser.isPasswordMatch(loginPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Password mismatch! Please provide a correct password.",
      });
    }
    // generate tokens for login route
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      existingUser._id
    );

    const loggedUser = await User.findById(existingUser._id).select(
      "-password -refreshToken"
    );

    if(!loggedUser) {
      return res
        .status(500)
        .json({ message: "Something went wrong while trying to login!" });
    }

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: MAX_AGE * 1000, // unit - milliseconds
    };

    // console.log("login success");

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        success: true,
        message: "Logged In Successfully!",
        user: loggedUser,
        accessToken,
        refreshToken,
      });
  } catch (error) {
    res.status(400).json(error.message);
  }
});

// LOGOUT USER - GET method
const logoutUser = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: MAX_AGE * 1000, // unit - milliseconds
  };

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
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json({ success: true, message: "Logged Out Successfully!" });
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).json({ success: true, message: "Internal Server Error" });
  }
});

// ALL USERS - GET method
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

module.exports = { registerUser, loginUser, logoutUser, allUsers };
