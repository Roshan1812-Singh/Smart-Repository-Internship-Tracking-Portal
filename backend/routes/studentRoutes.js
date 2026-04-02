const express = require("express");
const router = express.Router();

const {
  registerStudent,
  addStudent,
  getStudents,
  getStudentProfile,
  updateStudentProfile,
  uploadResume,
  uploadDocument,
  uploadProfileImage,
  getStudentTasks,
} = require("../controllers/studentController");

const { getNotifications, markNotificationRead } = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Multer config for resumes
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads/resumes");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads/profiles");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("application/pdf") ||
      file.mimetype === "application/msword" ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, DOC, images allowed"));
    }
  },
});

const profileUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images allowed for profile"));
    }
  },
});

// 🔥 NEW: Student self-registration
router.post("/register", registerStudent);

// Existing routes
router.post("/add", protect, authorizeRoles("mentor"), addStudent);

router.get("/", protect, authorizeRoles("mentor"), getStudents);

router.get("/profile", protect, getStudentProfile);

router.get("/profile/:id", protect, getStudentProfile);

router.put("/profile", protect, updateStudentProfile);

router.put("/profile/:id", protect, updateStudentProfile);

router.post(
  "/profile-image-upload",
  protect,
  authorizeRoles("student"),
  profileUpload.single("profileImage"),
  uploadProfileImage,
);

router.post(
  "/resume-upload",
  protect,
  authorizeRoles("student"),
  resumeUpload.single("resume"),
  uploadResume,
);

router.get("/tasks", protect, authorizeRoles("student"), getStudentTasks);

// Report submission with document
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "..", "uploads/documents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname),
    );
  },
});

const reportUpload = multer({
  storage: reportStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("application/pdf") ||
      file.mimetype.startsWith("image/")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and images allowed for reports"));
    }
  },
});

const { createReport } = require("../controllers/reportController");

router.post(
  "/reports",
  protect,
  authorizeRoles("student"),
  reportUpload.single("document"),
  createReport,
);

// Notifications
router.get("/notifications", protect, authorizeRoles("student"), getNotifications);
router.put("/notifications/:notificationId/read", protect, authorizeRoles("student"), markNotificationRead);

module.exports = router;
