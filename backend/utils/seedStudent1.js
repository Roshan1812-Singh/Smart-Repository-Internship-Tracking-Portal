const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Internship = require('../models/Internship');
const Progress = require('../models/Progress');
const Report = require('../models/Report');
const connectDB = require('../config/db');

async function seedStudent1Data() {
  await connectDB();

  console.log('🔍 Searching for Student1 and Mentor1 profiles...');

  // Find Student1
  const studentUser = await User.findOne({ email: 'student1@gmail.com', role: 'student' });
  if (!studentUser) {
    return console.log('❌ Student1 (student1@gmail.com) not found. Login first or check email.');
  }

  // Find Mentor
  const mentorEmails = ['mentor1@gmail.com', 'mentor@gmail.com', 'test@mentor.com'];
  let mentorUser = null;
  for (const email of mentorEmails) {
    mentorUser = await User.findOne({ email, role: 'mentor' });
    if (mentorUser) {
      console.log(`✅ Found mentor: ${mentorUser.email}`);
      break;
    }
  }
  if (!mentorUser) {
    console.log('Available mentors:', await User.find({role: 'mentor'}).select('email -_id'));
    return console.log('❌ No mentor found. Use test@mentor.com or update script.');
  }

  // Create/Update Student profile
  let student = await Student.findOne({ user: studentUser._id });
  if (!student) {
    student = await Student.create({
      user: studentUser._id,
      name: studentUser.name,
      email: studentUser.email,
      department: 'Computer Science',
      mentor: mentorUser._id,
    });
    console.log('✅ Created Student profile');
  } else {
    student.mentor = mentorUser._id;
    await student.save();
    console.log('✅ Updated Student profile');
  }

  // Link mentor-student
  if (!studentUser.mentor) {
    await User.findByIdAndUpdate(studentUser._id, { mentor: mentorUser._id });
  }
  await User.findByIdAndUpdate(mentorUser._id, { $addToSet: { assignedStudents: studentUser._id } });
  console.log('✅ Mentor-Student linked');

  // Clean old data
  await Internship.deleteMany({ student: studentUser._id });
  await Progress.deleteMany({ student: student._id });
  await Report.deleteMany({ student: studentUser._id });

  // Sample Internships
  await Internship.insertMany([
    {
      student: studentUser._id,
      companyName: 'TechCorp Innovations',
      role: 'Frontend Developer Intern',
      domain: 'Web Development',
      projectTitle: 'E-Commerce Dashboard',
      status: 'approved',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
    },
    {
      student: studentUser._id,
      companyName: 'StartupX Labs',
      role: 'Backend Engineer Intern',
      domain: 'Fullstack Development',
      projectTitle: 'REST API Service',
      status: 'pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
    }
  ]);
  console.log('✅ Added 2 Internships');

  // Sample Tasks
  await Progress.insertMany([
    {
      student: student._id,
      mentor: mentorUser._id,
      taskTitle: 'Introduction Assignment',
      description: 'Setup dev environment.',
      status: 'in-progress',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      student: student._id,
      mentor: mentorUser._id,
      taskTitle: 'Frontend Challenge',
      description: 'Build landing page.',
      status: 'pending',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    }
  ]);
  console.log('✅ Added 2 Tasks');

  // Sample Reports (for Reports page)
  await Report.insertMany([
    {
      student: studentUser._id,
      mentor: mentorUser._id,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      tasksCompleted: 'Completed React form validation, API integration',
      technologiesUsed: 'React, Tailwind, Axios',
      hoursWorked: 25,
      problemsFaced: 'JWT token expiry handling',
      status: 'submitted'
    },
    {
      student: studentUser._id,
      mentor: mentorUser._id,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tasksCompleted: 'Fixed UI bugs, added responsive design',
      technologiesUsed: 'React Hooks, CSS Grid',
      hoursWorked: 18,
      problemsFaced: 'Mobile responsiveness',
      status: 'reviewed',
      mentorReview: 'Good progress, focus on edge cases'
    }
  ]);
  console.log('✅ Added 2 Reports (Reports & Analytics data)');

  console.log('🎉 SEED COMPLETE!');
  console.log('Login student1@gmail.com → Reports page now has data + analytics!');
  process.exit(0);
}

seedStudent1Data().catch(console.error);

