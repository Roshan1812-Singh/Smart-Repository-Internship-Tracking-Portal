const mongoose = require("mongoose");

const internshipSchema = new mongoose.Schema(
  {
    companyName: String,
    role: String,
    duration: String,
    domain: String,
    startDate: Date,
    endDate: Date,
    projectTitle: String,

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: String,
      enum: ["pending", "approved", "active", "completed", "rejected"],
      default: "pending",
    },

    rejectionRemark: String,
    notes: String,
    progress: { 
      type: Number, 
      default: 0 
    },
    appliedOn: { 
      type: Date, 
      default: Date.now 
    },

    documents: {
      offerLetter: mongoose.Schema.Types.Mixed,
      completionCertificate: mongoose.Schema.Types.Mixed,
      finalReport: mongoose.Schema.Types.Mixed,
      proofOfApplication: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true, strict: false },
);



module.exports = mongoose.model("Internship", internshipSchema);
