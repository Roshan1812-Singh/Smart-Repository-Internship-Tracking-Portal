const Internship = require("../models/Internship");
const User = require("../models/User");

exports.getStudentDashboard = async (req, res) => {
  try {
    const total = await Internship.countDocuments({
      student: req.user._id,
    });

    const approved = await Internship.countDocuments({
      student: req.user._id,
      status: "approved",
    });

    const rejected = await Internship.countDocuments({
      student: req.user._id,
      status: "rejected",
    });

    const pending = await Internship.countDocuments({
      student: req.user._id,
      status: "pending",
    });

    res.status(200).json({
      total,
      approved,
      rejected,
      pending,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAdminDashboard = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({
      role: "student",
    });

    const totalInternships = await Internship.countDocuments();

    const approved = await Internship.countDocuments({
      status: "approved",
    });

    const rejected = await Internship.countDocuments({
      status: "rejected",
    });

    const pending = await Internship.countDocuments({
      status: "pending",
    });

    const recentInternships = await Internship.find()
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      totalStudents,
      totalInternships,
      approved,
      rejected,
      pending,
      recentInternships,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
