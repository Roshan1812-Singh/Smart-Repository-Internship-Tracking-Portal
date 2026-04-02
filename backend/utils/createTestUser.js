const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Progress = require('../models/Progress');
const Internship = require('../models/Internship');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

async function createTestUser() {
  await connectDB();

  // Delete existing test data
  await Progress.deleteMany({ taskTitle: { $in: ['Intro Task', 'Frontend Challenge'] } });
  await Student.deleteOne({ email: 'test@student.com' });
  await User.deleteOne({ email: 'test@student.com' });
  await User.deleteOne({ email: 'test@mentor.com' });

  const studentPassword = await bcrypt.hash('123456', 10);
  const mentorPassword = await bcrypt.hash('123456', 10);

  // Create test mentor
  const mentor = await User.create({
    name: 'Test Mentor',
    email: 'test@mentor.com',
    password: mentorPassword,
    role: 'mentor'
  });

  // Create test student user
  const studentUser = await User.create({
    name: 'Test Student',
    email: 'test@student.com',
    password: studentPassword,
    role: 'student',
    mentor: mentor._id
  });

  // Create student profile
  const studentProfile = await Student.create({
    user: studentUser._id,
    name: 'Test Student',
    email: 'test@student.com',
    department: 'Computer Science',
    year: '3rd',
    college: 'Test College',
    mentor: mentor._id
  });

  // Clean any existing internships for this student
  await Internship.deleteMany({ student: studentUser._id });

  // Create sample Internships
  await Internship.insertMany([
    {
      student: studentUser._id,
      companyName: 'TechCorp Innovations',
      role: 'Frontend Developer Intern',
      domain: 'Web Development',
      projectTitle: 'E-Commerce Dashboard',
      status: 'approved',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
    },
    {
      student: studentUser._id,
      companyName: 'StartupX Labs',
      role: 'Backend Engineer Intern',
      domain: 'Fullstack Development',
      projectTitle: 'REST API Service',
      status: 'pending',
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    }
  ]);

  // Create sample tasks
  await Progress.insertMany([
    {
      student: studentProfile._id,
      mentor: mentor._id,
      taskTitle: 'Intro Task',
      description: 'Complete the introduction assignment and setup your development environment.',
      status: 'pending',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    {
      student: studentProfile._id,
      mentor: mentor._id,
      taskTitle: 'Frontend Challenge',
      description: 'Build a responsive landing page using React and Tailwind CSS.',
      status: 'pending',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
    }
  ]);

  console.log('✅ Test data created successfully!');
  console.log('✅ Added: Mentor, Student User/Profile, 2 Progress Tasks, 2 Internships (approved + pending)');
  console.log('Student:', 'test@student.com / 123456');
  console.log('Mentor:', 'test@mentor.com / 123456');
  console.log('\\n🚀 Test steps:');
  console.log('1. Backend running: cd backend && npm start');
  console.log('2. Frontend: cd frontend && npm run dev');
  console.log('3. Login Student: http://localhost:5173/login');
  console.log('4. Check: My Applications (2 apps), Internship Details, Tasks (2 tasks)');
  process.exit(0);
}

createTestUser().catch(console.error);

