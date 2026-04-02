const express = require("express");
const router = express.Router();

const {
  createReport,
  getReports,
  reviewReport,
  getAdminAnalytics,
} = require("../controllers/reportController");


const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.post(
  "/",
  protect,
  authorizeRoles("student"),
  createReport
);

router.get(
  "/",
  protect,
  getReports
);

router.get(
  "/analytics",
  protect,
  authorizeRoles("admin", "superadmin"),
  getAdminAnalytics
);


router.put(
  "/:id/review",
  protect,
  authorizeRoles("mentor"),
  reviewReport
);

module.exports = router;