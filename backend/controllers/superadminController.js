const SystemConfig = require("../models/SystemConfig");
const Report = require("../models/Report");
const User = require("../models/User");

// System Dashboard
const getSystemDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalMentors = await User.countDocuments({ role: "mentor" });
    const totalAdmins = await User.countDocuments({ role: "admin" });
    const totalSuperAdmins = await User.countDocuments({ role: "superadmin" });

    // Simple activity count - could be enhanced with logs
    const activeUsers = await User.countDocuments({ isSuspended: false });

    res.json({
      totalUsers,
      totalStudents,
      totalMentors,
      totalAdmins,
      totalSuperAdmins,
      activeUsers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin Management
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } });
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addAdmin = async (req, res) => {
  try {
    const { name, email, password, role = "admin" } = req.body;
    const admin = new User({ name, email, password, role });
    await admin.save();
    res.status(201).json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.json({ message: "Admin removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const user = await User.findByIdAndUpdate(id, { permissions }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// User Management (all users)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { suspend } = req.body;
    const user = await User.findByIdAndUpdate(id, { isSuspended: suspend }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(id, { role }, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// System Configuration
const getSystemConfig = async (req, res) => {
  try {
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig();
      await config.save();
    }
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSystemConfig = async (req, res) => {
  try {
    const updates = req.body;
    let config = await SystemConfig.findOne();
    if (!config) {
      config = new SystemConfig(updates);
    } else {
      Object.assign(config, updates);
    }
    await config.save();
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Data & Backup (simplified)
const exportData = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("student", "name email")
      .populate("mentor", "name email")
      .lean();

    const data = JSON.stringify({ exportDate: new Date().toISOString(), reports }, null, 2);
    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="database-export-${Date.now()}.json"`
    });
    res.send(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Security Controls
const getSecurityLogs = async (req, res) => {
  try {
    const suspendedUsers = await User.find({ isSuspended: true })
      .select("name email role updatedAt")
      .lean()
      .sort({ updatedAt: -1 });
    const totalSuspended = await User.countDocuments({ isSuspended: true });
    res.json({ suspendedUsers, totalSuspended });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Role & Permission Management (persisted in SystemConfig)
const allPossiblePermissions = [
  "manage-admins", "manage-users", "manage-permissions", "manage-system",
  "manage-students", "manage-mentors", "view-reports", "export-data",
  "access-security", "configure-system", "view-students", "review-reports",
  "view-progress", "submit-reports"
];

const DEFAULT_ROLE_PERMISSIONS = {
  superadmin: [
    "manage-admins", "manage-users", "manage-permissions", "manage-system",
    "manage-students", "manage-mentors", "view-reports", "export-data",
    "access-security", "configure-system"
  ],
  admin: ["manage-students", "manage-mentors", "view-reports"],
  mentor: ["view-students", "review-reports"],
  student: ["view-progress", "submit-reports"],
};

// Load (or initialise) the SystemConfig doc and ensure rolePermissions exists.
const loadRolePermissions = async () => {
  let config = await SystemConfig.findOne();
  if (!config) config = await SystemConfig.create({});
  if (!config.rolePermissions) {
    config.rolePermissions = { ...DEFAULT_ROLE_PERMISSIONS };
    await config.save();
  }
  return config;
};

const getRoles = async (req, res) => {
  try {
    const config = await loadRolePermissions();
    const roles = Object.keys(config.rolePermissions).map((name) => ({ name }));
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRolePermissions = async (req, res) => {
  try {
    const { role } = req.params;
    const config = await loadRolePermissions();
    const permissions = config.rolePermissions[role] || [];
    res.json({ permissions, allPossiblePermissions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const toggleRolePermission = async (req, res) => {
  try {
    const { role } = req.params;
    const { permission } = req.body;
    if (!permission) {
      return res.status(400).json({ message: "Permission is required" });
    }

    const config = await loadRolePermissions();
    const current = config.rolePermissions[role] || [];

    config.rolePermissions[role] = current.includes(permission)
      ? current.filter((p) => p !== permission)
      : [...current, permission];

    // Mixed-type fields need an explicit dirty flag to persist.
    config.markModified("rolePermissions");
    await config.save();

    res.json(config.rolePermissions[role]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAccessLogs = async (req, res) => {
  // Mock enhanced access logs
  const logs = [
    { user: "admin@example.com", route: "/admin/dashboard", method: "GET", time: new Date(Date.now() - 3600000), ip: "192.168.1.1" },
    { user: "student1@ex.com", route: "/student/progress", method: "POST", time: new Date(Date.now() - 7200000), ip: "192.168.1.2" },
    { user: "mentor1@ex.com", route: "/mentor/reports", method: "GET", time: new Date(Date.now() - 10800000), ip: "192.168.1.3" },
  ];
  res.json(logs);
};

const getLoginMonitoring = async (req, res) => {
  const users = await User.find()
    .select("email lastLogin")
    .sort({ lastLogin: -1 })
    .lean();
  res.json(users.slice(0, 50)); // Last 50 logins
};

const getBackupHistory = async (req, res) => {
  // Mock backup history
  const history = [
    { id: 1, date: new Date(Date.now() - 86400000), size: "2.3MB", status: "Success" },
    { id: 2, date: new Date(Date.now() - 172800000), size: "2.1MB", status: "Success" },
    { id: 3, date: new Date(Date.now() - 259200000), size: "1.9MB", status: "Failed" },
  ];
  res.json(history);
};

module.exports = {
  getSystemDashboard,
  getAllAdmins,
  addAdmin,
  removeAdmin,
  updatePermissions,
  getAllUsers,
  suspendUser,
  updateUserRole,
  getSystemConfig,
  updateSystemConfig,
  exportData,
  getSecurityLogs,
  getRoles,
  getRolePermissions,
  toggleRolePermission,
  getAccessLogs,
  getLoginMonitoring,
  getBackupHistory
};