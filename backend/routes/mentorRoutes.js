const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createMentorProfile,
  getMentorProfile,
  updateMentorProfile,
  getAssignedStudents,
  getMentorStats,
  getMentorReports,
  getMentorTasks,
  getStudentsForEval,
  createEvaluation,
  assignTask,
  sendBulkMessage,
  generateStudentReport,
  uploadMentorDocument,
  uploadMentorResource,
  getMentorSchedule,
  updateMentorSchedule,
} = require("../controllers/mentorController");

const { getNotifications, markNotificationRead } = require("../controllers/adminController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Create upload directories if they don't exist
const docsDir = path.join(__dirname, '../uploads/documents/mentor');
const resourcesDir = path.join(__dirname, '../uploads/resources/mentor');
if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
if (!fs.existsSync(resourcesDir)) fs.mkdirSync(resourcesDir, { recursive: true });

// Multer configuration for documents
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, docsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Multer configuration for resources
const resourceStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resourcesDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const resourceUpload = multer({
  storage: resourceStorage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post("/profile", protect, authorizeRoles("mentor"), createMentorProfile);
router.put("/profile", protect, authorizeRoles("mentor"), updateMentorProfile);

router.get("/profile", protect, authorizeRoles("mentor"), getMentorProfile);

router.get(
  "/assigned-students",
  protect,
  authorizeRoles("mentor"),
  getAssignedStudents,
);

router.get("/stats", protect, authorizeRoles("mentor"), getMentorStats);

router.get("/reports", protect, authorizeRoles("mentor"), getMentorReports);

router.get("/tasks", protect, authorizeRoles("mentor"), getMentorTasks);

router.get("/students-for-eval", protect, authorizeRoles("mentor"), getStudentsForEval);
router.post("/evaluation", protect, authorizeRoles("mentor"), createEvaluation);

router.post("/assign-task", protect, authorizeRoles("mentor"), assignTask);
router.post("/bulk-message", protect, authorizeRoles("mentor"), sendBulkMessage);
router.get("/student-report/:studentId", protect, authorizeRoles("mentor"), generateStudentReport);

router.post(
  "/documents",
  protect,
  authorizeRoles("mentor"),
  documentUpload.single('file'),
  uploadMentorDocument
);

router.post(
  "/resources",
  (req, res, next) => {
    console.log('🔍 Route /resources hit');
    console.log('Method:', req.method);
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');
    next();
  },
  protect,
  authorizeRoles("mentor"),
  resourceUpload.single('file'),
  uploadMentorResource
);

router.get("/schedule", protect, authorizeRoles("mentor"), getMentorSchedule);
router.put("/schedule", protect, authorizeRoles("mentor"), updateMentorSchedule);

router.get("/student/tasks", protect, async (req, res) => {
  try {
    const tasks = await Progress.find({ student: req.user._id });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Notifications
router.get("/notifications", protect, authorizeRoles("mentor"), getNotifications);
router.put("/notifications/:notificationId/read", protect, authorizeRoles("mentor"), markNotificationRead);

module.exports = router;
