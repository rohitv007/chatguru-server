const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },
  filename: (req, file, cb) => {
    // console.log("middleware file:", file);
    const fileName = Date.now() + "_" + file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage });
module.exports = upload;
