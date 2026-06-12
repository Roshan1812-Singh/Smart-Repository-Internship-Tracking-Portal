const Student = require("../models/Student");
const User = require("../models/User");
const Progress = require("../models/Progress");
const bcrypt = require("bcryptjs");
const { sendCredentialsEmail } = require('../utils/sendEmail');
const { getFileUrl } = require("../config/upload");

exports.registerStudent = async (req, res) => {
  try {
    console.log('📥 Student register request:', req.body);
    
    const { 
      name, email: rawEmail, password, phone, department, year, college, course, 
      mentorEmail 
    } = req.body;
    const email = rawEmail?.trim()?.toLowerCase();

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email required" });
    }

    console.log(`🔍 Normalized email query: "${email}"`);

    // 🔥 FIXED: Check ONLY User table + valid Students (ignore orphans)
    console.log(`🔍 Checking email: ${email}`);
    const existingUser = await User.findOne({ email }).select('_id name role');
    const existingStudent = await Student.findOne({ 
      email, 
      user: { $ne: null }  // Only block valid Students with User
    }).populate('user', 'name');
    
    console.log('User found:', existingUser ? `ID:${existingUser._id} role:${existingUser.role}` : 'none');
    console.log('Student found:', existingStudent ? `ID:${existingStudent._id} user:${existingStudent.user?._id}` : 'none (orphan ignored)');
    
    if (existingUser) {
      console.log('❌ Duplicate USER found');
      return res.status(400).json({ 
        message: "Email already registered (user exists)", 
        debug: { user: existingUser._id.toString() }
      });
    }
    
    if (existingStudent) {
      console.log('❌ Duplicate STUDENT found');
      return res.status(400).json({ 
        message: "Email already registered (student exists)", 
        debug: { student: existingStudent._id.toString() }
      });
    }
    
    console.log('✅ Email available - proceeding');

    // Use provided password (plaintext) or generate one
    let plainPassword;
    if (password && password.length >= 6) {
      plainPassword = password;
      console.log(`🔑 Using provided password for ${email}`);
    } else {
      plainPassword = Math.random().toString(36).slice(-8);
      console.log(`🔑 Generated password for ${email}`);
    }

    // Find mentor by email first
    let mentorId = null;
    if (mentorEmail) {
      const normalizedMentorEmail = mentorEmail?.trim()?.toLowerCase();
      const mentor = await User.findOne({ email: normalizedMentorEmail, role: 'mentor' });
      if (mentor) {
        mentorId = mentor._id;
        console.log(`👨‍🏫 Assigned mentor: ${mentorEmail}`);
      } else {
        console.log(`⚠️ Mentor not found: ${mentorEmail}`);
      }
    }

    // Create User
    console.log('👤 Creating User...');
    const user = await User.create({
      name,
      email,
      password: plainPassword,
      role: "student",
      mentor: mentorId,
    });
    console.log(`✅ User created: ${user._id}`);

    // Create Student Profile - support new fields
    console.log('🎓 Creating Student profile...');
    const student = await Student.create({
      user: user._id,
      name,
      email,
      phone,
      department,
      year: parseInt(year) || 1,
      college,
      course,
      mentor: mentorId,
    });
    console.log('✅ Created Student with fields:', {
      studentId: student._id,
      name: student.name,
      email: student.email,
      phone: student.phone,
      department: student.department,
      year: student.year,
      college: student.college,
      course: student.course,
      hasMentor: !!mentorId
    });
    console.log(`✅ Student profile created`);

    // Update mentor's assigned students
    if (mentorId) {
      await User.findByIdAndUpdate(mentorId, {
        $addToSet: { assignedStudents: user._id },
      });
      console.log(`✅ Updated mentor assigned students`);
    }

// 📧 Send credentials email with DB tracking
    try {
      await sendCredentialsEmail(email, plainPassword);
      
      // ✅ Mark as sent in DB
      await User.findByIdAndUpdate(user._id, {
        credentialsEmailSent: true,
        lastEmailAttempt: new Date()
      });
      console.log(`✅ Credentials email sent & tracked for ${email}`);
    } catch (emailError) {
      console.error('❌ Email failed - tracking error:', emailError.message);
      
      // Track failure in DB
      await User.findByIdAndUpdate(user._id, {
        credentialsEmailSent: false,
        lastEmailAttempt: new Date(),
        $push: { emailSendErrors: { error: emailError.message } }
      });
      
      // Continue with created user, return password so client can use it.
      console.log(`⚠️ Email failed but user ${email} created OK`);
      return res.status(201).json({
        message: "Student registered successfully but email sending failed. Use the returned password or ask admin to check email config.",
        email,
        studentId: user._id,
        credentialsEmailSent: false,
        emailError: emailError.message,
        password: plainPassword
      });
    }

    console.log(`🎉 Registration COMPLETE: ${email}`);
    res.status(201).json({
      message: "Student registered successfully. Check your email or contact admin for password if email fails.",
      email,
      studentId: user._id,
      credentialsEmailSent: true,
      password: plainPassword // fallback in response so user can login immediately
    });
  } catch (error) {
    console.error('💥 REGISTER ERROR:', error);
    console.error('Stack:', error.stack);
    res.status(400).json({ 
      message: error.message || 'Registration failed - check server logs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.addStudent = async (req, res) => {
  try {
    const { name, email, department, year, phone, college, course } = req.body;

    const student = await Student.create({
      name,
      email,
      department,
      year,
      phone,
      college,
      course,
      mentor: req.user._id,
    });

    res.status(201).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find({
      mentor: req.user._id,
    }).populate("user", "name email");

    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentProfile = async (req, res) => {
  try {
    let student;

    if (!req.params.id) {
      if (req.user.role !== "student") {
        return res.status(403).json({ message: "Access denied" });
      }

      student = await Student.findOne({ user: req.user._id }).populate([
        "mentor",
        {
          path: 'user',
          populate: {
            path: 'assignedStudents',
            select: 'name email role'
          }
        }
      ]);

      if (!student) {
        student = await Student.create({
          user: req.user._id,
          name: req.user.name,
          email: req.user.email,
        });
      }

      // 🔥 NEW: Defensive sync - if student.mentor missing, use user.mentor
      if (!student.mentor && req.user.mentor) {
        student.mentor = req.user.mentor;
        await student.save();
      }
    } else {
      student = await Student.findById(req.params.id).populate([
        "mentor",
        {
          path: 'user',
          populate: {
            path: 'assignedStudents',
            select: 'name email role'
          }
        }
      ]);

      // Defensive sync for other students too
      if (student && !student.mentor && student.user && student.user.mentor) {
        student.mentor = student.user.mentor;
        await student.save();
      }
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.updateStudentProfile = async (req, res) => {
  try {
    let student;

    if (!req.params.id) {
      student = await Student.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true },
      );
    } else {
      student = await Student.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });
    }

    res.status(200).json({ success: true, student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const profilePath = getFileUrl(req.file, "profiles");

    await Student.findOneAndUpdate(
      { user: req.user._id },
      { profileImage: profilePath },
      { new: true },
    );

    res.json({
      success: true,
      profileUrl: profilePath,
    });
  } catch (error) {
    console.error("Profile upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const resumePath = getFileUrl(req.file, "resumes");

    await Student.findOneAndUpdate(
      { user: req.user._id },
      { resume: resumePath },
      { new: true },
    );

    res.json({
      success: true,
      resumeUrl: resumePath,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};


exports.uploadDocument = async (req, res) => {
  try {
    const { internshipId, documentType, fileUrl } = req.body;

    if (!internshipId || !documentType || !fileUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const internship = await Internship.findById(internshipId);

    if (!internship) {
      return res.status(404).json({ message: "Internship not found" });
    }

    // Ensure documents object exists
    if (!internship.documents) {
      internship.documents = {};
    }

    internship.documents[documentType] = {
      url: fileUrl,
      verified: false,
    };

    await internship.save();

    res.json({ message: "Document uploaded successfully" });
  } catch (error) {
    console.error("UPLOAD ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getStudentTasks = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Access denied" });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    const tasks = await Progress.find({ student: student._id })
      .populate("mentor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    console.error("Get student tasks error:", error);
    res.status(500).json({ message: error.message });
  }
}; 

