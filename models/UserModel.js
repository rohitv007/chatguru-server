const mongoose = require("mongoose");
const { isEmail, isStrongPassword, isLength } = require("validator");
const Schema = mongoose.Schema

const userSchema = new Schema(
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
    pic: {
      type: String,
      required: true,
      default:
        "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
