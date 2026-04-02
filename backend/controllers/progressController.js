const Progress = require("../models/Progress");
const Student = require("../models/Student");

exports.addProgress = async (req, res) => {
  try {
    const { studentId, taskTitle, description } = req.body;

    if (!studentId || !taskTitle) {
      return res.status(400).json({
        success: false,
        message: "studentId and taskTitle are required",
      });
    }

    // Accept either Student document _id or User _id (from mentor UI).
    let studentDoc;
    if (studentId && studentId.match(/^[0-9a-fA-F]{24}$/)) {
      studentDoc = await Student.findById(studentId);
      if (!studentDoc) {
        studentDoc = await Student.findOne({ user: studentId });
      }
    } else {
      studentDoc = await Student.findOne({ user: studentId });
    }

    if (!studentDoc) {
      return res.status(404).json({
        success: false,
        message: "Student not found for given studentId",
      });
    }

    const progress = await Progress.create({
      student: studentDoc._id,
      mentor: req.user._id,
      taskTitle,
      description,
    });

    res.status(201).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentProgress = async (req, res) => {
  try {
    const progress = await Progress.find({
      student: req.params.studentId,
    }).populate("student", "name email");

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getStudentTasks = async (req, res) => {
  try {
    const Student = require("../models/Student");
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(200).json([]);
    }
    const tasks = await Progress.find({ student: student._id }).populate("mentor", "name");

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { status, progressPercentage, notes, submissionLink } = req.body;

  if (submissionLink !== undefined) {
    req.body.submissionLink = submissionLink;
  }

    const updateData = {
      status,
      progressPercentage,
      notes,
      ...(submissionLink !== undefined && { submissionLink })
    };

    const progress = await Progress.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};