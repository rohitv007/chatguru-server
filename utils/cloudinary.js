const cloudinary = require("cloudinary").v2;
const fs = require("fs");

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload file to Cloudinary
const uploadFileToCloudinary = async (localFilePath, fileType) => {
  if (!localFilePath) return null;

  try {
    const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: fileType,
    });

    return uploadResponse;
  } catch (error) {
    console.error("Error uploading image to Cloudinary:", error);
    return null;
  } finally {
    // Remove the locally saved temporary file
    fs.unlinkSync(localFilePath);
  }
};

module.exports = uploadFileToCloudinary;
