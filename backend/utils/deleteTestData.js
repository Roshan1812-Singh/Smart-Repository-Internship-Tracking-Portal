const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const Progress = require('../models/Progress');
const Internship = require('../models/Internship');
const connectDB = require('../config/db');

async function deleteTestData() {
  await connectDB();

  // Delete test users and related data
  await User.deleteMany({ email: { $in: ['test@student.com', 'test@mentor.com'] } });
  await Student.deleteMany({ email: { $in: ['test@student.com'] } });
  await Progress.deleteMany({ taskTitle: { $in: ['Intro Task', 'Frontend Challenge'] } });
  await Internship.deleteMany({ companyName: { $in: ['TechCorp Innovations', 'StartupX Labs'] } });

  console.log('✅ Test data deleted!');
  process.exit(0);
}

deleteTestData().catch(console.error);
