const { v2: cloudinary } = require("cloudinary");

const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("☁️  Cloudinary configured — uploads go to the cloud.");
} else {
  console.warn(
    "⚠️  Cloudinary NOT configured — uploads fall back to local disk (lost on redeploy). " +
      "Set CLOUDINARY_* env vars for production."
  );
}

module.exports = { cloudinary, isCloudinaryConfigured };
