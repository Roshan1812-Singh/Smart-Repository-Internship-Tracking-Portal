const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const Student = require("../models/Student");
const {
  sendResetPasswordEmail,
  sendOtpEmail,
  sendCredentialsEmail,
} = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

// 🔑 TOKENS
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
};

const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "1d",
  });
};

//
// ✅ REGISTER (FIXED)
//
exports.register = async (req, res) => {

  try {
    let { name, email, role } = req.body;

    email = email.trim().toLowerCase();
    role = role.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 🔥 AUTO PASSWORD GENERATION
    const plainPassword = crypto.randomBytes(4).toString("hex");

    const user = await User.create({
      name,
      email,
      password: plainPassword,
      role,
    });

    // Student profile
    if (role === "student") {
      await Student.create({
        user: user._id,
        name,
        email,
      });
    }

    // 📩 SEND CREDENTIALS (DEV MODE safe)
    try {
      await sendCredentialsEmail(email, plainPassword);
      console.log(`✅ Credentials email sent to ${email}`);
    } catch (emailError) {
      console.error(`❌ Email failed for ${email}:`, emailError.message);
      // Don't fail the registration, just log the email error
      // Return the password in response so user can login immediately
    }

    res.status(201).json({
      success: true,
      message: "User registered. Credentials sent.",
      email,
      password: plainPassword // Fallback: return password in response
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    let { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields required" });
    }

    email = email.trim().toLowerCase();
    role = role.toLowerCase();

    const user = await User.findOne({ email }).select("+password");

    if (!user || user.role !== role) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      console.log("❌ Password mismatch");
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save();

    res.json({
      accessToken,
      refreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: "If email exists, reset link sent",
      });
    }

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: "1h" },
    );

    user.resetPasswordToken = await bcrypt.hash(resetToken, 10);
    user.resetPasswordExpire = Date.now() + 3600000;

    await user.save();

    await sendResetPasswordEmail(user.email, resetToken, user.name);

    res.json({
      success: true,
      message: "Reset link sent",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "+resetPasswordToken +resetPasswordExpire +password",
    );

    if (!user || user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: "Token expired" });
    }

    const isValid = await bcrypt.compare(token, user.resetPasswordToken);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset success" });
  } catch (err) {
    res.status(500).json({ message: "Error" });
  }
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  await sendOtpEmail(email, otp);

  res.json({ success: true });
};

// 🔄 REFRESH TOKEN ENDPOINT
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

// 🚪 LOGOUT ENDPOINT
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    user.refreshToken = null;
    await user.save();

    res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(401).json({ message: "Invalid refresh token" });
  }
};


exports.verifyOtpAndReset = async (req, res) => {
  const { email, otp, password } = req.body;

  const user = await User.findOne({ email }).select("+otp");

  if (!user || user.otpExpire < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  const isMatch = await bcrypt.compare(otp, user.otp);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpire = undefined;

  await user.save();

  res.json({ success: true });
};
