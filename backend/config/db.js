const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sritp");
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("Database connection failed");
    process.exit(1);
  }
};

module.exports = connectDB;
