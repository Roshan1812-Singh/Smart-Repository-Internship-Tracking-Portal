const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const {
  getDashboardStats,
  getAllStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  assignMentorToStudent,
  getAllMentors,
  addMentor,
  updateMentor,
  assignStudentsToMentor,
  getAllInternships,
  getInactiveStudents,
  getNotifications,
  getReports,
  sendNotification,
  verifyDocument,
  markNotificationRead,
  cleanupExpiredNotifications,
} = require("../controllers/adminController");

const {
  getBackupHistory,
  getLoginMonitoring,
  getAccessLogs,
} = require("../controllers/superadminController")



const {
  getSystemDashboard,
  getAllAdmins,
  addAdmin,
  removeAdmin,
  updatePermissions,
  getAllUsers,
  suspendUser,
  updateUserRole,
  getSystemConfig,
  updateSystemConfig,
  exportData,
  getSecurityLogs,
  getRoles,
  getRolePermissions,
  toggleRolePermission,
} = require("../controllers/superadminController");

router.get(
  "/dashboard",
  protect,
  authorizeRoles("admin", "superadmin"),
  getDashboardStats,
);

// Student Management
router.get(
  "/students",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllStudents,
);
router.post(
  "/students",
  protect,
  authorizeRoles("admin", "superadmin"),
  addStudent,
);
router.put(
  "/students/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  updateStudent,
);
router.delete(
  "/students/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  deleteStudent,
);
router.post(
  "/assign-mentor",
  protect,
  authorizeRoles("admin", "superadmin"),
  assignMentorToStudent,
);

// Mentor Management
router.get(
  "/mentors",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllMentors,
);
router.post(
  "/mentors",
  protect,
  authorizeRoles("admin", "superadmin"),
  addMentor,
);
router.put(
  "/mentors/:id",
  protect,
  authorizeRoles("admin", "superadmin"),
  updateMentor,
);
router.post(
  "/assign-students",
  protect,
  authorizeRoles("admin", "superadmin"),
  assignStudentsToMentor,
);

// Internship Tracking
router.get(
  "/internships",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAllInternships,
);
router.get(
  "/inactive-students",
  protect,
  authorizeRoles("admin", "superadmin"),
  getInactiveStudents,
);

// Reports & Analytics
router.get(
  "/reports",
  protect,
  authorizeRoles("admin", "superadmin"),
  getReports,
);

// Notifications
router.post(
  "/notifications",
  protect,
  authorizeRoles("admin", "superadmin"),
  sendNotification,
);
router.get(
  "/notifications",
  protect,
  authorizeRoles("admin", "superadmin"),
  getNotifications,
);
router.put(
  "/notifications/:notificationId/read",
  protect,
  markNotificationRead,
);

// Cleanup expired notifications
router.post(
  "/notifications/cleanup",
  protect,
  authorizeRoles("admin", "superadmin"),
  cleanupExpiredNotifications,
);


// Document Verification
router.post(
  "/verify-document",
  protect,
  authorizeRoles("admin", "superadmin"),
  verifyDocument,
);

// Super Admin Routes
router.get(
  "/system-dashboard",
  protect,
  authorizeRoles("superadmin"),
  getSystemDashboard,
);
router.get("/all-admins", protect, authorizeRoles("superadmin"), getAllAdmins);
router.post("/admins", protect, authorizeRoles("superadmin"), addAdmin);
router.delete(
  "/admins/:id",
  protect,
  authorizeRoles("superadmin"),
  removeAdmin,
);
router.put(
  "/permissions/:id",
  protect,
  authorizeRoles("superadmin"),
  updatePermissions,
);
router.get("/all-users", protect, authorizeRoles("superadmin"), getAllUsers);
router.put("/suspend/:id", protect, authorizeRoles("superadmin"), suspendUser);
router.put(
  "/update-role/:id",
  protect,
  authorizeRoles("superadmin"),
  updateUserRole,
);
router.get(
  "/system-config",
  protect,
  authorizeRoles("superadmin"),
  getSystemConfig,
);
router.put(
  "/system-config",
  protect,
  authorizeRoles("superadmin"),
  updateSystemConfig,
);
router.get("/export-data", protect, authorizeRoles("superadmin"), exportData);
router.get(
  "/security-logs",
  protect,
  authorizeRoles("superadmin"),
  getSecurityLogs,
);
router.get("/roles", protect, authorizeRoles("superadmin"), getRoles);
router.get(
  "/roles/:role/permissions",
  protect,
  authorizeRoles("superadmin"),
  getRolePermissions,
);
router.post(
  "/roles/:role/permissions",
  protect,
  authorizeRoles("superadmin"),
  toggleRolePermission,
);
router.get(
  "/login-monitoring",
  protect,
  authorizeRoles("superadmin"),
  getLoginMonitoring,
);

router.get(
  "/access-logs",
  protect,
  authorizeRoles("superadmin"),
  getAccessLogs,
);

router.get("/backup-history", protect, authorizeRoles("superadmin"), getBackupHistory);

module.exports = router;
