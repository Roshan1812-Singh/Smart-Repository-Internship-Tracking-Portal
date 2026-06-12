const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary, isCloudinaryConfigured } = require("./cloudinary");

/**
 * Build a multer uploader that writes to Cloudinary when configured,
 * otherwise to local disk under `uploads/<folder>`.
 *
 * Use `getFileUrl(req.file, folder)` to read the resulting URL:
 *  - Cloudinary  -> absolute https URL (file.path)
 *  - Local disk  -> relative "/uploads/<folder>/<filename>"
 *
 * The frontend `fileUrl()` helper resolves both forms correctly.
 */
const makeUploader = ({ folder, maxSizeMB = 5, allowedMimePrefixes = null }) => {
  let storage;

  if (isCloudinaryConfigured) {
    storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: `sritp/${folder}`,
        resource_type: "auto",
        public_id: (req, file) =>
          `${Date.now()}-${path.parse(file.originalname).name}`.replace(/\s+/g, "_"),
      },
    });
  } else {
    const dir = path.join(__dirname, "..", "uploads", folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    storage = multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
    });
  }

  const fileFilter = allowedMimePrefixes
    ? (req, file, cb) => {
        const ok = allowedMimePrefixes.some((p) => file.mimetype.startsWith(p));
        cb(ok ? null : new Error("Unsupported file type"), ok);
      }
    : undefined;

  return multer({
    storage,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
    ...(fileFilter ? { fileFilter } : {}),
  });
};

const getFileUrl = (file, folder) => {
  if (!file) return "";
  if (isCloudinaryConfigured) return file.path; // Cloudinary secure URL
  return `/uploads/${folder}/${file.filename}`;
};

module.exports = { makeUploader, getFileUrl, isCloudinaryConfigured };
