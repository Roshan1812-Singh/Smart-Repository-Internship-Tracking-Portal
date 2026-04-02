const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

async function resetPassword() {
  await connectDB();
  
  const email = 'baghelayushsingh28@gmail.com';
  const newPassword = '42sib6ps';
  
  const hashedPw = await bcrypt.hash(newPassword, 10);
  
  const user = await User.findOneAndUpdate(
    { email },
    { 
      password: hashedPw,
      $unset: { resetPasswordToken: '', otp: '', refreshToken: '' }
    },
    { new: true }
  );
  
  if (!user) {
    console.log('❌ User not found');
    process.exit(1);
  }
  
  console.log('✅ Password reset!');
  console.log('Email:', email);
  console.log('New PW:', newPassword);
  console.log('User ID:', user._id);
  
  process.exit(0);
}

resetPassword().catch(console.error);

