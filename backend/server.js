require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
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
}, 24 * 60 * 60 * 1000);

// Normalize an origin by stripping any trailing slash so that
// "https://sritp.vercel.app/" and "https://sritp.vercel.app" both match.
const normalizeOrigin = (o) => (o || "").trim().replace(/\/+$/, "");

const corsOrigins = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : ["https://sritp.vercel.app", "http://localhost:5173", "http://localhost:3000"]
)
  .map(normalizeOrigin)
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, server-to-server, health checks).
    if (!origin) return callback(null, true);
    if (corsOrigins.includes(normalizeOrigin(origin))) {
      return callback(null, true);
    }
    console.warn(`CORS blocked origin: ${origin}. Allowed:`, corsOrigins);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
};

app.use(cors(corsOptions));
// Ensure preflight requests succeed for every route.
app.options(/.*/, cors(corsOptions));

// Security headers. crossOriginResourcePolicy relaxed so the React app
// (different origin) can load images/files served from /uploads.
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Trust the proxy (Render/Vercel) so rate limiting + secure cookies work.
app.set("trust proxy", 1);

// Throttle auth endpoints to slow brute-force attempts.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again later." },
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
    origin: corsOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Clients join a room named after their user id so that
  // `io.to(userId).emit(...)` actually reaches them.
  socket.on("join", (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`Socket ${socket.id} joined room ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

app.use("/api/auth", authLimiter, authRoutes);
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

// Lightweight health check for uptime monitors / Render.
app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");
  res.json({
    success: true,
    status: "ok",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
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

