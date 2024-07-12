const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const asyncHandler = require("express-async-handler");

const checkAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log('HEADER =>', authHeader);

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];
  // console.log('TOKEN =>', token);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log("decoded user =>", decoded);

    // Check if the user exists
    const currUser = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );
    // console.log('current user =>', currUser);
    if (!currUser) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    req.user = currUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(403).send("Forbidden");
  }
});

module.exports = { checkAuth };
