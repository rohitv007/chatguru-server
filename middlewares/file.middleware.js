const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log("middleware", file);
    cb(
      null,
      Date.now() + "_" + file.originalname + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage });
module.exports = upload;
