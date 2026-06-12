const crypto = require("crypto");
const User = require("../models/User");
const Student = require("../models/Student");
// const { sendCredentialsEmail } = require("../utils/emailService");

exports.register = async (req, res) => {
  try {
    let { name, email, password, phone, department, year, college, course, mentorEmail, role = 'student' } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    email = email.trim().toLowerCase();
    role = role.toLowerCase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ✅ Use user-provided password (Model auto-hashes)
    const user = await User.create({
      name,
      email,
      password,  // Will be hashed by pre-save hook
      role,
      ...(role === 'student' && { phone, department, year: parseInt(year), college, course, mentorEmail })
    });

    // ✅ Create student profile if needed
    if (role === "student") {
      await Student.create({
        user: user._id,
        name,
        email,
        phone,
        department,
        year: parseInt(year),
        college,
        course,
        ...(mentorEmail && { mentorEmail })
      });
    }

console.log(`✅ Self-service registration complete: ${email}`);

    res.status(201).json({
      success: true,
      message: "User registered successfully! Please login with your password.",
      userId: user._id
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
