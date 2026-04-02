require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const internshipRoutes = require("./routes/internshipRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const adminRoutes = require("./routes/adminRoutes");
const mentorRoutes = require("./routes/mentorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const progressRoutes = require("./routes/progressRoutes");
const reportRoutes = require("./routes/reportRoutes");
const messageRoutes = require("./routes/messageRoutes");

const path = require('path');
const multer = require('multer');

const app = express();

connectDB();

// Scheduled cleanup of expired notifications (runs every 24 hours)
const { cleanupExpiredNotifications } = require("./controllers/adminController");
setInterval(async () => {
  try {
    console.log("🧹 Running scheduled cleanup of expired notifications...");
    const result = await cleanupExpiredNotifications({ body: {} }, {
      json: (data) => console.log("✅ Cleanup result:", data.message),
      status: () => ({ json: (data) => console.log("❌ Cleanup error:", data.message) })
    });
  } catch (error) {
    console.error("❌ Scheduled cleanup failed:", error.message);
  }
}, 24 * 60 * 60 * 1000); // 24 hours

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global error handler for multer
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large (max 5MB)' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/mentor", mentorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SRITP Backend Running 🚀",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

