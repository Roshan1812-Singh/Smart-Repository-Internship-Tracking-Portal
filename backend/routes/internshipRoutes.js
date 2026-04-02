const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const Internship = require("../models/Internship");
const User = require("../models/User");

const {
  getStudentInternship,
  updateStudentInternship,
  uploadDocument,
  verifyDocument,
} = require("../controllers/internshipController");

// ================= CREATE INTERNSHIP =================
router.post("/create", protect, authorizeRoles("student"), async (req, res) => {
  try {
    const internship = await Internship.create({
      ...req.body,
      student: req.user._id,
      status: "pending",
    });

    res.status(201).json({
      message: "Internship submitted successfully",
      internship,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ================= GET ALL INTERNSHIPS =================
router.get(
  "/all",
  protect,
  authorizeRoles("mentor", "admin", "superadmin"),
  async (req, res) => {
    try {
      const internships = await Internship.find()
        .populate("student", "name email role")
        .populate("mentor", "name email")
        .sort({ createdAt: -1 });

      res.json(internships);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ================= STUDENT ROUTES =================
router.get(
  "/student",
  protect,
  getStudentInternship,
);

router.put(
  "/student",
  protect,
  authorizeRoles("student"),
  updateStudentInternship,
);

// DELETE single internship
router.delete(
  "/:id",
  protect,
  authorizeRoles("student"),
  require("../controllers/internshipController").deleteStudentInternship
);


// ================= DOCUMENT UPLOAD =================
// ✅ FIXED WITH MULTER (single file upload)
const { uploadMiddleware } = require("../controllers/internshipController");
router.post("/upload", protect, authorizeRoles("student"), uploadMiddleware.single("document"), uploadDocument);

// Remove document
router.post("/remove-document", protect, authorizeRoles("student"), require("../controllers/internshipController").removeDocument);


// ================= DOCUMENT VERIFICATION =================
router.post(
  "/verify",
  protect,
  authorizeRoles("mentor", "admin", "superadmin"),
  verifyDocument,
);

// ================= FINAL REVIEW =================
router.put(
  "/:id/final-review",
  protect,
  authorizeRoles("mentor", "admin", "superadmin"),
  async (req, res) => {
    try {
      const { finalMentorReview, status } = req.body;

      const internship = await Internship.findById(req.params.id);

      if (!internship) {
        return res.status(404).json({ message: "Internship not found" });
      }

      internship.finalMentorReview = finalMentorReview;

      if (status) internship.status = status;

      internship.finalReviewedBy = req.user._id;
      internship.finalReviewedAt = new Date();

      await internship.save();

      res.json({
        message: "Final review submitted successfully",
        internship,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ================= ANALYTICS / STATS =================
router.get(
  "/stats",
  protect,
  authorizeRoles("mentor", "admin", "superadmin"),
  async (req, res) => {
    try {
      const stats = await Internship.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]);

      const formatted = {
        approved: 0,
        rejected: 0,
        pending: 0,
        active: 0,
        completed: 0,
      };

      stats.forEach((item) => {
        formatted[item._id] = item.count;
      });

      res.json(formatted);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

// ================= STUDENT STATS =================
router.get(
  "/student/stats",
  protect,
  authorizeRoles("student"),
  async (req, res) => {
    try {
      const internships = await Internship.find({
        student: req.user._id,
      });

      const stats = {
        approved: 0,
        rejected: 0,
        pending: 0,
        active: 0,
        completed: 0,
      };

      internships.forEach((item) => {
        stats[item.status] = (stats[item.status] || 0) + 1;
      });

      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

module.exports = router;
