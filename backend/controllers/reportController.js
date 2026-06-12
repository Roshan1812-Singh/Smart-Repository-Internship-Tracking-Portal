const Report = require("../models/Report");
const Internship = require("../models/Internship");
const Evaluation = require("../models/Evaluation");
const { getFileUrl } = require("../config/upload");

exports.createReport = async (req, res) => {
  try {
    const { date, tasksCompleted, technologiesUsed, hoursWorked, problemsFaced } = req.body;

    if (!req.user.mentor) {
      return res.status(400).json({ success: false, message: "No mentor assigned to you yet" });
    }

    const reportData = {
      student: req.user._id,
      mentor: req.user.mentor,
      date,
      tasksCompleted,
      technologiesUsed,
      hoursWorked,
      problemsFaced,
    };

    if (req.file) {
      reportData.document = {
        filename: req.file.originalname || req.file.filename,
        path: getFileUrl(req.file, "documents"),
        mimeType: req.file.mimetype,
        size: req.file.size
      };
    }

    const report = await Report.create(reportData);
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 

exports.getReports = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'mentor') {
      query.mentor = req.user._id;
    }
    const reports = await Report.find(query).populate('student mentor');
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin analytics endpoint
exports.getAdminAnalytics = async (req, res) => {
  try {
    // 1. Internship completion rate
    const completionStats = await Internship.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    let totalInternships = 0, completed = 0;
    completionStats.forEach(stat => {
      totalInternships += stat.count;
      if (stat._id === 'completed') completed = stat.count;
    });
    const completionRate = totalInternships > 0 ? Math.round((completed / totalInternships) * 100) : 0;

    // 2. Evaluation averages (simple avgs - no arrays in $avg)
    const evalStats = await Evaluation.aggregate([
      {
        $group: {
          _id: null,
          avgTechnical: { $avg: "$technicalSkills" },
          avgCommunication: { $avg: "$communication" },
          avgProblemSolving: { $avg: "$problemSolving" },
          avgWorkEthics: { $avg: "$workEthics" },
          totalEvals: { $sum: 1 }
        }
      },
      {
        $project: {
          avgOverall: {
            $divide: [
              { $add: ["$avgTechnical", "$avgCommunication", "$avgProblemSolving", "$avgWorkEthics"] },
              4
            ]
          },
          avgTechnical: 1,
          avgCommunication: 1,
          avgProblemSolving: 1,
          avgWorkEthics: 1,
          totalEvals: 1
        }
      }
    ]);
    const evals = evalStats[0] || { avgOverall: 0, totalEvals: 0, avgTechnical: 0, avgCommunication: 0, avgProblemSolving: 0, avgWorkEthics: 0 };

    // 3. Report stats
    const reportStats = await Report.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 4. Top students (aggregate first, then avg)
    const topStudentsRaw = await Evaluation.aggregate([
      {
        $group: {
          _id: "$student",
          scores: { $push: {
            technical: "$technicalSkills",
            communication: "$communication", 
            problemSolving: "$problemSolving",
            workEthics: "$workEthics"
          }},
          count: { $sum: 1 }
        }
      },
      { $sort: { "scores.0": -1 } }, // Temp sort, will recalculate avg
      { $limit: 5 }
    ]);

    const topStudents = await Promise.all(topStudentsRaw.map(async studentData => {
      const scores = studentData.scores;
      const avgScore = scores.reduce((sum, s) => sum + ((s.technical + s.communication + s.problemSolving + s.workEthics) / 4), 0) / scores.length;
      
      const studentUser = await require('../models/User').findById(studentData._id).select('name email');
      
      return {
        _id: studentData._id,
        avgScore,
        student: studentUser,
        count: studentData.count
      };
    }));

    res.json({
      success: true,
      analytics: {
        completionRate,
        totalInternships,
        evaluationAverages: evals,
        reportStats,
        topStudents
      }
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reviewReport = async (req, res) => {
  try {
    const { mentorReview, action } = req.body; // action: 'approve' or 'reject'
    const report = await Report.findById(req.params.id).populate('student');
    
    if (!report || report.status === 'reviewed') {
      return res.status(400).json({ success: false, message: 'Report not found or already reviewed' });
    }

    const status = action === 'reject' ? 'rejected' : 'approved';
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { 
        mentorReview, 
        status,
        reviewedAt: new Date()
      },
      { new: true }
    ).populate('student');

    // Send notification to student
    const Notification = require('../models/Notification');
    const remark = action === 'reject' ? 'rejected with remarks' : 'approved';
    await Notification.create({
      title: `Report ${status.toUpperCase()}`,
      message: `Your report has been ${remark}: "${mentorReview}". Check details.`,
      targetRole: 'student',
      sender: req.user._id,
      readBy: []
    });

    res.status(200).json({ success: true, report: updatedReport });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

