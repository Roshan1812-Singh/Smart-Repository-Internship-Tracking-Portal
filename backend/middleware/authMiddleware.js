const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }

      if (user.isSuspended) {
        return res.status(403).json({ message: "User account suspended" });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("JWT Error:", error.message);

      return res.status(401).json({
        message: "Invalid or expired token",
      });
    }
  } else {
    return res.status(401).json({
      message: "Authorization header missing",
    });
  }
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

if (!roles.includes(req.user.role)) {
      console.log(`🚫 403 FORBIDDEN - User: ${req.user.email} (${req.user.role}) tried accessing role(s): ${roles.join(", ")}`);
      return res.status(403).json({
        message: `Access denied. Required role(s): ${roles.join(", ")}. Your role: ${req.user.role}`,
      });
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };
