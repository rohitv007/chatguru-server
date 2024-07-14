const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const asyncHandler = require("express-async-handler");

const verifyJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  // console.log('HEADER =>', authHeader);

  if (!authHeader?.startsWith("Bearer ") || !req.cookies?.accessToken) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  try {
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized request" });
    }
    // console.log('TOKEN =>', token);

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log("decoded user =>", decodedToken);

    // Check if the user exists
    const currentUser = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!currentUser) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Invalid Access Token" });
    }

    // console.log('Current User =>', currentUser);
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized: Token expired" });
    }
    return res.status(403).send("Forbidden");
  }
});

module.exports = { verifyJWT };
