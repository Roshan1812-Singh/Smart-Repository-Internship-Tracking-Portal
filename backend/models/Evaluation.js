const mongoose = require("mongoose");

const evaluationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    technicalSkills: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },

    communication: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },

    problemSolving: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },

    workEthics: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },

    comments: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Evaluation", evaluationSchema);