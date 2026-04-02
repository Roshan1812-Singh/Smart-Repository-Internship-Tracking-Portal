const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    tasksCompleted: {
      type: String,
    },

    technologiesUsed: {
      type: String,
    },

    hoursWorked: {
      type: Number,
    },

    problemsFaced: {
      type: String,
    },

    mentorReview: {
      type: String,
    },

    status: {
      type: String,
      enum: ["submitted", "reviewed", "approved", "rejected"],
      default: "submitted",
    },
    document: {
      filename: String,
      path: String,
      mimeType: String,
      size: Number
    }
  },
  { timestamps: true }
); 

module.exports = mongoose.model("Report", reportSchema);