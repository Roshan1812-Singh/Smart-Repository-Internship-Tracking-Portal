const express = require("express");
const router = express.Router();

const {
  addProgress,
  getStudentProgress,
  getStudentTasks,
  updateProgress,
} = require("../controllers/progressController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

router.post(
  "/add",
  protect,
  authorizeRoles("mentor"),
  addProgress
);

router.get(
  "/student/:studentId",
  protect,
  authorizeRoles("mentor"),
  getStudentProgress
);

router.get(
  "/student",
  protect,
  authorizeRoles("student"),
  getStudentTasks
);

router.put(
  "/update/:id",
  protect,
  authorizeRoles("mentor"),
  updateProgress
);

router.put(
  "/:id",
  protect,
  updateProgress
);

module.exports = router;