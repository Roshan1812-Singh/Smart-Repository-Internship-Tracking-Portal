const mongoose = require("mongoose");

const systemConfigSchema = new mongoose.Schema(
  {
    internshipRules: {
      maxDuration: { type: Number, default: 6 }, // months
      minDuration: { type: Number, default: 1 },
      requiredDocuments: [{ type: String }],
    },
    reportFrequency: {
      daily: { type: Boolean, default: true },
      weekly: { type: Boolean, default: true },
      monthly: { type: Boolean, default: false },
    },
    evaluationCriteria: {
      technicalSkills: { type: Number, default: 40 },
      communication: { type: Number, default: 20 },
      teamwork: { type: Number, default: 20 },
      punctuality: { type: Number, default: 20 },
    },
    systemSettings: {
      maintenanceMode: { type: Boolean, default: false },
      allowRegistration: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemConfig", systemConfigSchema);