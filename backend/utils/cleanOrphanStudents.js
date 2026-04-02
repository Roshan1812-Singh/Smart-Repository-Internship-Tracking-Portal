const mongoose = require('mongoose');
const Student = require('../models/Student');
const User = require('../models/User');

const cleanOrphanStudents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/sritp');
    
    // Find orphans: Students without matching User
    const orphans = await Student.find({ user: null }).select('email _id');
    console.log(`Found ${orphans.length} orphan Students:`);
    orphans.forEach(s => console.log(`  - ${s.email} (_id: ${s._id})`));
    
    if (orphans.length === 0) {
      console.log('✅ No orphans found');
      process.exit(0);
    }
    
    // Delete orphans
    const result = await Student.deleteMany({ user: null });
    console.log(`✅ Deleted ${result.deletedCount} orphan students`);
    
    const validStudents = await Student.find({}).populate('user', 'email').select('email');
    console.log('Remaining valid students:', validStudents.length);
    
    process.exit(0);
  } catch (error) {
    console.error('Cleanup failed:', error);
    process.exit(1);
  }
};

cleanOrphanStudents();
