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

const { makeUploader } = require("../config/upload");

const resumeUpload = makeUploader({
  folder: "resumes",
  maxSizeMB: 5,
  allowedMimePrefixes: ["application/pdf", "application/msword", "image/"],
});

const profileUpload = makeUploader({
  folder: "profiles",
  maxSizeMB: 2,
  allowedMimePrefixes: ["image/"],
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
const reportUpload = makeUploader({
  folder: "documents",
  maxSizeMB: 10,
  allowedMimePrefixes: ["application/pdf", "image/"],
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
