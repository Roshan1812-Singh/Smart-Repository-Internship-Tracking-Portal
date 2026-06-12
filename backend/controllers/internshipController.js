const Internship = require("../models/Internship");

const path = require("path");
const fs = require("fs");
const { makeUploader, getFileUrl } = require("../config/upload");

// Document uploader (Cloudinary in prod, local disk in dev)
const upload = makeUploader({ folder: "documents", maxSizeMB: 10 });

exports.getInternshipStats = async (req, res) => {
  try {
    const stats = await Internship.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    let result = {
      approved: 0,
      rejected: 0,
      pending: 0,
    };

    stats.forEach((item) => {
      result[item._id] = item.count;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { internshipId, documentType } = req.body;
    const file = req.file;

    if (!internshipId || !documentType || !file) {
      return res.status(400).json({ message: "Missing internshipId, documentType or file" });
    }

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // Handle legacy boolean false → full object
    const currentDoc = internship.documents[documentType];
    if (typeof currentDoc === 'boolean' && !currentDoc) {
      internship.documents[documentType] = { url: "", verified: false };
    }

    // Store the file URL (Cloudinary absolute URL or local relative path)
    const url = getFileUrl(file, "documents");
    internship.documents[documentType] = {
      ...internship.documents[documentType],
      url,
      verified: false
    };

    await internship.save();

    console.log(`✅ Document uploaded: ${documentType} -> ${url}`);

    res.json({ 
      message: "Document uploaded successfully",
      url 
    });

  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Export multer for route use
exports.uploadMiddleware = upload;
// ================= GET STUDENT INTERNSHIP =================
exports.getStudentInternship = async (req, res) => {
  try {
    const internships = await Internship.find({
      student: req.user._id,
    }).populate('mentor', 'name email');

    // Compute average progress from Progress model for each internship/student
    const Progress = require('../models/Progress');
    const Student = require('../models/Student');
    
    const studentDoc = await Student.findOne({ user: req.user._id });
    if (studentDoc) {
      const progressEntries = await Progress.find({ student: studentDoc._id });
      const avgProgress = progressEntries.length > 0 
        ? Math.round(progressEntries.reduce((sum, p) => sum + (p.progressPercentage || 0), 0) / progressEntries.length)
        : 0;

      // Update all internships with avg progress
      await Internship.updateMany(
        { student: req.user._id },
        { $set: { progress: avgProgress } }
      );

      // Re-fetch with updated progress
      const updatedInternships = await Internship.find({
        student: req.user._id,
      }).populate('mentor', 'name email');
      
      res.json(updatedInternships);
    } else {
      res.json(internships);
    }
  } catch (error) {
    console.error("Get student internships error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ================= UPDATE =================
exports.updateStudentInternship = async (req, res) => {
  try {
    const internship = await Internship.findOneAndUpdate(
      { student: req.user._id },
      req.body,
      { new: true, upsert: true }
    );

    res.status(200).json(internship);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove specific document
exports.removeDocument = async (req, res) => {
  try {
    const { internshipId, documentType } = req.body;

    if (!internshipId || !documentType) {
      return res.status(400).json({ message: "Missing internshipId or documentType" });
    }

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    const currentDoc = internship.documents[documentType];

    if (!currentDoc?.url) {
      return res.status(400).json({ message: "No document to remove" });
    }

    // Extract filename from URL (e.g. /uploads/documents/123-file.pdf -> 123-file.pdf)
    const filename = path.basename(currentDoc.url);
    const filePath = path.join(process.cwd(), 'backend', 'uploads', 'documents', filename);

    // Delete physical file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Deleted file: ${filePath}`);
    }

    // Reset document field
    internship.documents[documentType] = {
      url: "",
      verified: false
    };

    await internship.save();

    res.json({ 
      message: `${documentType} document removed successfully`,
      url: "" 
    });

  } catch (error) {
    console.error("REMOVE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


// ================= VERIFY =================
exports.verifyDocument = async (req, res) => {
  try {
    const { internshipId, documentType, verified } = req.body;

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    if (!internship.documents?.[documentType]?.url) {
      return res.status(400).json({ message: "Document not uploaded yet" });
    }

    internship.documents[documentType].verified = verified;

    await internship.save();

    res.json({ message: "Document verification updated" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteStudentInternship = async (req, res) => {
  try {
    const { id } = req.params;

    const internship = await Internship.findOne({
      _id: id,
      student: req.user._id
    });

    if (!internship) {
      return res.status(404).json({ message: "Internship not found or access denied" });
    }

    // Delete associated documents if exist
    if (internship.documents) {
      Object.values(internship.documents).forEach(doc => {
        if (doc.url && typeof doc.url === 'string') {
          const filename = path.basename(doc.url);
          const filePath = path.join(process.cwd(), 'backend', 'uploads', 'documents', filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      });
    }

    await Internship.findByIdAndDelete(id);

    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("DELETE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};


