const express = require("express");
const router = express.Router();
const { makeUploader } = require("../config/upload");

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

const documentUpload = makeUploader({ folder: "documents/mentor", maxSizeMB: 10 });
const resourceUpload = makeUploader({ folder: "resources/mentor", maxSizeMB: 5 });

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

// Notifications
router.get("/notifications", protect, authorizeRoles("mentor"), getNotifications);
router.put("/notifications/:notificationId/read", protect, authorizeRoles("mentor"), markNotificationRead);

module.exports = router;
