const MentorProfile = require("../models/MentorProfile");
const Student = require("../models/Student");
const Report = require("../models/Report");
const Progress = require("../models/Progress");
const Evaluation = require("../models/Evaluation");
const Internship = require("../models/Internship");
const User = require("../models/User");
const Message = require("../models/Message");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");


exports.createMentorProfile = async (req, res) => {
  try {
    const existingProfile = await MentorProfile.findOne({
      user: req.user._id,
    });

    if (existingProfile) {
      return res.status(400).json({
        message: "Profile already exists",
      });
    }

    const profile = await MentorProfile.create({
      user: req.user._id,
      ...req.body,
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while creating profile",
    });
  }
};

exports.getMentorProfile = async (req, res) => {
  try {
    const mentorUser = await User.findById(req.user._id).populate({
      path: "assignedStudents",
      match: { role: "student" },
      select: "name email department year college course resume role",
    });

    const profile = await MentorProfile.findOne({
      user: req.user._id,
    }).populate("user", "name email role");

    const assignedCount = mentorUser.assignedStudents.length;

    // Success % - % of completed internships/reports for assigned students (placeholder)
    const successPercentage = assignedCount > 0 ? 85 : 0; // TODO: Calculate from Reports

    const response = {
      ...(profile ? profile.toObject() : {}),
      user: mentorUser,
      stats: {
        assignedStudents: assignedCount,
        successPercentage,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while fetching profile",
    });
  }
};

exports.updateMentorProfile = async (req, res) => {
  try {
    const { designation, organization, department, phone, bio, skills, experience, linkedin, availability, availabilitySchedule } = req.body;

    const profile = await MentorProfile.findOneAndUpdate(
      { user: req.user._id },
      {
        $set: {
          designation,
          organization,
          department,
          phone,
          bio,
          skills: skills || [],
          experience: experience || 0,
          linkedin,
          availability,
          availabilitySchedule: availabilitySchedule || []
        }
      },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

exports.getAssignedStudents = async (req, res) => {
  try {
    // ✅ SINGLE SOURCE OF TRUTH
    const studentsData = await Student.find({
      mentor: req.user._id,
    })
      .populate("user", "name email")
      .populate(
        "internship",
        "companyName role duration startDate endDate status",
      )
      .lean();

    const students = await Promise.all(
      studentsData.map(async (student) => {
        // Skip invalid students (missing user population)
        if (!student?.user || !student.user._id) {
          console.warn(`⚠️ Skipping invalid student (no user._id): ${student?._id}`);
          return null;
        }

        let lateSubs = 0;
        const studentDocId = student._id;

        if (studentDocId) {
          const now = new Date();
          lateSubs = await Progress.countDocuments({
            student: studentDocId,
            mentor: req.user._id,
            deadline: { $lt: now },
            status: { $ne: "completed" },
          });
        }

        const studentObj = {
          _id: student.user._id,
          name: student.user.name || 'Unknown',
          email: student.user.email || 'No email',
          phone: student.phone || "N/A",
          department: student.department || "N/A",
          year: student.year || "N/A",
          internship: student.internship || null,
          lateSubs,
          lastSubmission: student.internship?.updatedAt || null,
        };

        // Final validation
        if (!studentObj._id) {
          console.warn(`⚠️ Final filter: invalid studentObj _id for student ${student?._id}`);
          return null;
        }

        return studentObj;
      })
    ).then(results => results.filter(Boolean));

    // Double-check final array
    const finalStudents = students.filter(s => s && s._id);
    if (finalStudents.length !== students.length) {
      console.warn(`⚠️ Backend filter removed ${students.length - finalStudents.length} invalid students`);
      students.length = 0;
      students.push(...finalStudents);
    }

    res.status(200).json({ students });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMentorStats = async (req, res) => {
  try {
    const students = await Student.find({
      mentor: req.user._id,
    });

    const studentIds = students.map((s) => s._id);

    const totalStudents = students.length;

    const pendingReports = await Report.countDocuments({
      mentor: req.user._id,
      status: "submitted",
    });

    const completedTasks = await Progress.countDocuments({
      mentor: req.user._id,
      student: { $in: studentIds },
      status: "completed",
    });

    const activeTasks = await Progress.countDocuments({
      mentor: req.user._id,
      student: { $in: studentIds },
      status: "in-progress",
    });

    res.status(200).json({
      totalStudents,
      pendingReports,
      completedTasks,
      activeTasks,
    });
  } catch (error) {
    console.error("Mentor stats error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getMentorReports = async (req, res) => {
  try {
    const reports = await Report.find({ mentor: req.user._id }).populate(
      "student",
    );
    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMentorTasks = async (req, res) => {
  try {
    const tasks = await Progress.find({ mentor: req.user._id }).populate(
      "student",
    );
    res.status(200).json({ tasks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentsForEval = async (req, res) => {
  try {
    const mentor = await User.findById(req.user._id);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    const studentIds = mentor.assignedStudents || [];

    // Robust: Reuse same logic as getAssignedStudents (but lighter for eval)
    console.log(
      `📝 Eval: Mentor ${req.user._id}: checking ${studentIds.length} students`,
    );

    const assignedUsers = await User.find({
      _id: { $in: studentIds },
      role: "student",
    }).select("name email _id");

    const students = [];
    for (const user of assignedUsers) {
      const studentDoc = await Student.findOne({ user: user._id }).lean();
      students.push({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
        department: studentDoc?.department || "N/A",
        internship: null, // Light populate
      });
    }

    const evalStudents = students.map((s) => ({
      _id: s.user._id,
      name: s.user.name,
      email: s.user.email,
      department: s.department,
      internship: null,
    }));

    console.log(`✅ Eval: Built ${evalStudents.length} students`);

    res.status(200).json({ students: evalStudents });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createEvaluation = async (req, res) => {
  try {
    const {
      studentId,
      technicalSkills,
      communication,
      problemSolving,
      workEthics,
      comments,
    } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    if (
      !technicalSkills ||
      !communication ||
      !problemSolving ||
      !workEthics ||
      technicalSkills < 1 ||
      technicalSkills > 10 ||
      communication < 1 ||
      communication > 10 ||
      problemSolving < 1 ||
      problemSolving > 10 ||
      workEthics < 1 ||
      workEthics > 10
    ) {
      return res
        .status(400)
        .json({ message: "All ratings must be numbers between 1-10" });
    }

    const evaluation = await Evaluation.create({
      student: studentId,
      mentor: req.user._id,
      technicalSkills: Number(technicalSkills),
      communication: Number(communication),
      problemSolving: Number(problemSolving),
      workEthics: Number(workEthics),
      comments: comments || "",
    });

    res.status(201).json(evaluation);
  } catch (error) {
    console.error("Error creating evaluation:", error);
    res.status(500).json({ message: error.message });
  }
};

// Assign new task to specific student
exports.assignTask = async (req, res) => {
  try {
    const { studentId, taskTitle, description, deadline } = req.body;

    if (!studentId || !taskTitle) {
      return res
        .status(400)
        .json({ message: "Student ID and task title are required" });
    }

    // Get student document ID
    const studentDoc = await Student.findOne({ user: studentId });
    if (!studentDoc) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const task = await Progress.create({
      student: studentDoc._id,
      mentor: req.user._id,
      taskTitle,
      description: description || "",
      status: "pending",
      deadline: deadline ? new Date(deadline) : null,
    });

    res.status(201).json({ message: "Task assigned successfully", task });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ message: error.message });
  }
};

// Send bulk message to all assigned students
exports.sendBulkMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message content is required" });
    }

    // Get assigned students
    const mentor = await User.findById(req.user._id);
    const studentUserIds = mentor.assignedStudents || [];

    if (studentUserIds.length === 0) {
      return res
        .status(200)
        .json({ message: "No students assigned, message not sent" });
    }

    const students = await Student.find({ user: { $in: studentUserIds } });

    const Message = require("../models/Message");
    const sentMessages = [];
    for (const student of students) {
      const bulkMsg = await Message.create({
        sender: req.user._id,
        receiver: student.user._id,
        message,
        type: "announcement",
      });
      sentMessages.push(bulkMsg);
    }

    res.status(201).json({
      message: `Bulk message sent to ${sentMessages.length} students`,
      count: sentMessages.length,
    });
  } catch (error) {
    console.error("Error sending bulk message:", error);
    res.status(500).json({ message: error.message });
  }
};

// Generate comprehensive report for a student
exports.generateStudentReport = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({ message: "Student ID is required" });
    }

    const student = await Student.findOne({ user: studentId }).populate(
      "user internship",
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Aggregate all related data
    const progress = await Progress.find({
      student: student._id,
      mentor: req.user._id,
    });
    const reports = await Report.find({
      student: student._id,
      mentor: req.user._id,
    });
    const evaluations = await Evaluation.find({
      student: student._id,
      mentor: req.user._id,
    });

    const reportData = {
      student: {
        name: student.user.name,
        email: student.user.email,
        phone: student.phone,
        department: student.department,
        year: student.year,
      },
      internship: student.internship,
      tasks: progress,
      reports: reports,
      evaluations: evaluations,
      summary: {
        totalTasks: progress.length,
        completedTasks: progress.filter((p) => p.status === "completed").length,
        lateSubmissions: progress.filter(
          (p) =>
            p.deadline &&
            new Date(p.deadline) < new Date() &&
            p.status !== "completed",
        ).length,
        avgRating:
          evaluations.length > 0
            ? (
                evaluations.reduce(
                  (sum, e) =>
                    sum +
                    (e.technicalSkills +
                      e.communication +
                      e.problemSolving +
                      e.workEthics),
                  0,
                ) /
                (evaluations.length * 4)
              ).toFixed(1)
            : 0,
      },
    };

    res.status(200).json(reportData);
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.uploadMentorDocument = async (req, res) => {
  try {
    console.log('📄 Document upload request received');
    console.log('User:', req.user?._id);
    console.log('File:', req.file?.originalname);

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let profile = await MentorProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await MentorProfile.create({ 
        user: req.user._id,
        bio: 'Professional mentor',
        experience: 5,
        resources: [],
        documents: []
      });
      console.log('✅ Auto-created mentor profile');
    }

    const document = {
      name: req.body.name || req.file.originalname,
      url: `/uploads/documents/mentor/${req.file.filename}`,
      uploadedAt: new Date()
    };

    profile.documents.push(document);
    await profile.save();

    console.log('✅ Document uploaded successfully');
    res.status(201).json({ message: 'Document uploaded', document });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.uploadMentorResource = async (req, res) => {
  try {
    console.log('📁 Resource upload request received');
    console.log('User:', req.user?._id);
    console.log('File:', req.file?.originalname);
    console.log('Headers:', req.headers.authorization ? 'Token present' : 'No token');

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let profile = await MentorProfile.findOne({ user: req.user._id });
    if (!profile) {
      profile = await MentorProfile.create({ 
        user: req.user._id,
        bio: 'Professional mentor',
        experience: 5
      });
      console.log('✅ Auto-created mentor profile');
    }

    const resource = {
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'Docs',
      url: `/uploads/resources/mentor/${req.file.filename}`,
      uploadedAt: new Date()
    };

    profile.resources.push(resource);
    await profile.save();

    console.log('✅ Resource uploaded successfully');
    res.status(201).json({ message: 'Resource uploaded', resource });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.getMentorSchedule = async (req, res) => {
  try {
    const profile = await MentorProfile.findOne({ user: req.user._id }).select('availabilitySchedule');
    res.json(profile?.availabilitySchedule || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMentorSchedule = async (req, res) => {
  try {
    const { availabilitySchedule } = req.body;
    const profile = await MentorProfile.findOneAndUpdate(
      { user: req.user._id },
      { availabilitySchedule },
      { new: true }
    ).select('availabilitySchedule');
    res.json(profile.availabilitySchedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
