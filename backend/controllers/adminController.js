const User = require("../models/User");
const Internship = require("../models/Internship");
const Progress = require("../models/Progress");
const MentorProfile = require("../models/MentorProfile");
const Student = require("../models/Student");

// Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalMentors = await User.countDocuments({ role: "mentor" });
    const activeInternships = await Internship.countDocuments({
      status: "approved",
    });
    const completedInternships = await Internship.countDocuments({
      status: "completed",
    });
    const pendingEvaluations = await Progress.countDocuments({
      status: "pending",
    });

    const internshipStats = await Internship.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    let stats = {
      totalStudents,
      totalMentors,
      activeInternships,
      completedInternships,
      pendingEvaluations,
      approved: 0,
      rejected: 0,
      pending: 0,
      total: 0,
    };

    internshipStats.forEach((stat) => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Student Management
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({ role: "student" }).populate("mentor");
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addStudent = async (req, res) => {
  try {
    const { name, email, password, mentorId } = req.body;
    const student = new User({ name, email, password, role: "student" });
    await student.save();

    if (mentorId) {
      await User.findByIdAndUpdate(mentorId, {
        $push: { assignedStudents: student._id },
      });
    }

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const student = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Student deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignMentorToStudent = async (req, res) => {
  try {
    const { studentId, mentorId } = req.body;

    // Update User model
    await User.findByIdAndUpdate(studentId, { mentor: mentorId });
    await User.findByIdAndUpdate(mentorId, {
      $push: { assignedStudents: studentId },
    });

    // Also update Student model if it exists
    const Student = require("../models/Student");
    await Student.findOneAndUpdate(
      { user: studentId },
      { mentor: mentorId },
      { upsert: false },
    );

    res.json({ message: "Mentor assigned" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mentor Management
const getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).populate(
      "assignedStudents",
    );
    res.json(mentors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addMentor = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const mentor = new User({ name, email, password, role: "mentor" });
    await mentor.save();
    res.status(201).json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateMentor = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const mentor = await User.findByIdAndUpdate(id, updates, { new: true });
    res.json(mentor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignStudentsToMentor = async (req, res) => {
  try {
    const { mentorId, studentIds } = req.body;

    // ✅ STEP 1: Remove mentor from ALL these students
    await Student.updateMany(
      { user: { $in: studentIds } },
      { $unset: { mentor: "" } },
    );

    await User.updateMany(
      { _id: { $in: studentIds } },
      { $unset: { mentor: "" } },
    );

    // ✅ STEP 2: Assign new mentor
    await Student.updateMany(
      { user: { $in: studentIds } },
      { mentor: mentorId },
    );

    await User.updateMany({ _id: { $in: studentIds } }, { mentor: mentorId });

    // ✅ OPTIONAL: Keep assignedStudents clean (sync it properly)
    const students = await Student.find({ mentor: mentorId }).select("user");

    await User.findByIdAndUpdate(mentorId, {
      assignedStudents: students.map((s) => s.user),
    });

    res.json({ message: "Students assigned correctly (synced)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Internship Tracking
const getAllInternships = async (req, res) => {
  try {
    const internships = await Internship.find()
      .populate({
        path: "student",
        select: "name email department year college course resume mentor",
        populate: {
          path: "mentor",
          select: "name email",
        },
      })
      .populate("mentor", "name email");
    res.json(internships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getInactiveStudents = async (req, res) => {
  try {
    // Simple logic: students with no progress updates in last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const inactive = await Progress.find({
      updatedAt: { $lt: sevenDaysAgo },
    }).populate("student");
    res.json(inactive);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reports & Analytics
const getReports = async (req, res) => {
  try {
    const completionRate = await Internship.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    res.json({ completionRate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Notifications
const Notification = require("../models/Notification");

const sendNotification = async (req, res) => {
  try {
    const { title, message, targetRole, expiryDate } = req.body;
    if (!title || !message || !targetRole) {
      return res
        .status(400)
        .json({ message: "Title, message, and targetRole required" });
    }

    const notificationData = {
      title,
      message,
      targetRole,
      sender: req.user._id,
    };

    // Add expiry date if provided
    if (expiryDate) {
      notificationData.expiryDate = new Date(expiryDate);
    }

    const notification = await Notification.create(notificationData);

    res.status(201).json({
      success: true,
      message: "Notification sent successfully",
      notification,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    let query = { isActive: true };

    // Filter by role
    if (req.query.role) {
      if (req.query.role === "all") {
        query = { isActive: true };
      } else {
        query.targetRole = req.query.role;
      }
    } else if (req.user.role === "student") {
      query.targetRole = { $in: ["student", "all"] };
    } else if (req.user.role === "mentor") {
      query.targetRole = { $in: ["mentor", "all"] };
    }

    // Filter out expired notifications
    const now = new Date();
    query.$or = [
      { expiryDate: { $exists: false } }, // No expiry date
      { expiryDate: null }, // Null expiry date
      { expiryDate: { $gt: now } } // Not yet expired
    ];

    const notifications = await Notification.find(query)
      .populate("sender", "name email")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    // Check if already read by this user
    const alreadyRead = notification.readBy.some(
      (read) => read.user.toString() === req.user._id.toString(),
    );

    if (!alreadyRead) {
      notification.readBy.push({ user: req.user._id });
      await notification.save();
    }

    res.json({ success: true, message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Document Verification
const verifyDocument = async (req, res) => {
  try {
    const { internshipId, documentType, verified } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship.documents) internship.documents = {};
    internship.documents[documentType] = verified;
    await internship.save();
    res.json({ message: "Document verified" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cleanup expired notifications
const cleanupExpiredNotifications = async (req, res) => {
  try {
    const now = new Date();
    const result = await Notification.updateMany(
      { expiryDate: { $lte: now }, isActive: true },
      { isActive: false }
    );

    res.json({
      success: true,
      message: `Cleaned up ${result.modifiedCount} expired notifications`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
  getReports,
  sendNotification,
  getNotifications,
  markNotificationRead,
  cleanupExpiredNotifications,
  verifyDocument,
};
