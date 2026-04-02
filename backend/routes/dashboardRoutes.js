const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getStudentDashboard,
  getAdminDashboard,
} = require("../controllers/dashboardController");

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentDashboard
);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin", "superadmin", "mentor"),
  getAdminDashboard
);

module.exports = router;
