const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: {
      type: String,
      required: true,
      select: false,
    },

    role: {
      type: String,
      enum: ["superadmin", "admin", "mentor", "student"],
      default: "student",
    },

    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    permissions: {
      canManageAdmins: { type: Boolean, default: false },
      canManageUsers: { type: Boolean, default: false },
      canViewReports: { type: Boolean, default: false },
      canConfigureSystem: { type: Boolean, default: false },
      canAccessSecurity: { type: Boolean, default: false },
    },

    isSuspended: { type: Boolean, default: false },

    lastLogin: { type: Date },

    refreshToken: String,

    resetPasswordToken: {
      type: String,
      select: false,
    },

    resetPasswordExpire: Date,

    // 🆕 OTP fields
    otp: String,
    otpExpire: Date,

    // 📧 Email status tracking (NEW)
    credentialsEmailSent: { 
      type: Boolean, 
      default: false 
    },
    lastEmailAttempt: { 
      type: Date 
    },
    emailSendErrors: [{
      error: String,
      timestamp: { type: Date, default: Date.now }
    }]
  },
  { timestamps: true },
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
