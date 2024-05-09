const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");
const asyncHandler = require("express-async-handler");

const checkUser = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Token missing" });
  }

  const token = authHeader.split(" ")[1];
  // console.log('TOKEN =>', token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);
    // console.log("decoded user =>", decoded);

    // Check if the user exists
    const currUser = await UserModel.findById(decoded.id);
    // console.log(currUser);
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

module.exports = { checkUser };
