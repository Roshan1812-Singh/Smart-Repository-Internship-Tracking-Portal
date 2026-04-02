const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

async function createExactUser() {
  await connectDB();

  const email = 'baghelayushsingh28@gmail.com';
  const password = '42sib6ps';
  const name = 'Ayush Singh Baghel';
  const role = 'student';

  // Delete if exists
  await User.deleteOne({ email });
  await Student.deleteOne({ email });

  // Create user with plain password; mongoose pre-save hook hashes it
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role
  });

  // Create student profile
  const studentProfile = await Student.create({
    user: user._id,
    name,
    email
  });

  console.log('✅ Exact user created!');
  console.log('👤 Login:', email, '/', password);
  console.log('🆔 User ID:', user._id);
  console.log('📊 Student ID:', studentProfile._id);
  console.log('\\n🚀 Test:');
  console.log('1. Backend: cd backend && npm start');
  console.log('2. Frontend: cd frontend && npm run dev');
  console.log('3. Login: http://localhost:5173/login?role=student');
  
  process.exit(0);
}

createExactUser().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

