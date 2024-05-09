const mongoose = require("mongoose");
const { isEmail, isStrongPassword, isLength } = require("validator");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please provide a unique username"],
      unique: [true, "Username already taken! Please provide a new username"],
      lowercase: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email address"],
      unique: [true, "Email address already taken! Please provide a new email"],
      lowercase: true,
      validate: [isEmail, "Please enter valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
    },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);
module.exports = UserModel;