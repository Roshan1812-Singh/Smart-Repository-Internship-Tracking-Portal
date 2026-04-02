// Updated duplicate check logic for registerStudent
// Replace the existing check block with this:

// Check ONLY User table (primary auth) - ignore orphan Students
const existingUser = await User.findOne({ email }).select('_id name role');
const existingStudent = await Student.findOne({ 
  email, 
  user: { $ne: null }  // Only valid students with User
}).populate('user', 'name');

if (existingUser) {
  console.log('❌ Duplicate User found:', existingUser._id);
  return res.status(400).json({ 
    message: "Email already registered as user", 
    debug: { user: existingUser._id.toString() }
  });
}

if (existingStudent) {
  console.log('❌ Duplicate Student found:', existingStudent._id);
  return res.status(400).json({ 
    message: "Email already registered as student", 
    debug: { student: existingStudent._id.toString() }
  });
}

// Continue with registration...
