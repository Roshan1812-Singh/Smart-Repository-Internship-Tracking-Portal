const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    department: {
      type: String,
    },

    year: {
      type: String,
    },

    phone: {
      type: String,
    },

    college: {
      type: String,
    },

    course: {
      type: String,
    },

    resume: {
      type: String, // URL or path to resume
    },
    profileImage: {
      type: String, // URL or path to profile image
    },

    internship: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Internship"
    },
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true, // Make it optional for now
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Student", studentSchema);
