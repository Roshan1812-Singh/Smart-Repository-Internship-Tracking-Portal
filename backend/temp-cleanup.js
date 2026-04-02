const mongoose = require('mongoose');
const Student = require('./models/Student');
const User = require('./models/User');

async function cleanupOrphaned() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/sritp');
    console.log('Connected to MongoDB');
    
    const orphans = await Student.find({ user: null }).select('email _id');
    console.log('Orphaned Students:', orphans.map(s => ({_id: s._id, email: s.email})));
    
    const testEmail = 'baghelayushsingh28@gmail.com';
    const deleted = await Student.deleteMany({ email: { $regex: testEmail, $options: 'i' } });
    console.log(`✅ Deleted ${deleted.deletedCount} students with ${testEmail}`);
    
    const deletedUsers = await User.deleteMany({ email: { $regex: testEmail, $options: 'i' } });
    console.log(`✅ Deleted ${deletedUsers.deletedCount} users with ${testEmail}`);
    
    const users = await User.find({ email: testEmail });
    console.log('Users with test email:', users.map(u => ({_id: u._id, role: u.role})));
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

cleanupOrphaned();
