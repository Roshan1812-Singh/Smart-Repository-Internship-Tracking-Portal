const express = require("express");

const authController = require("../controllers/authController");

const router = express.Router();

// ✅ Core auth
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh", authController.refresh);
router.post("/logout", authController.logout);

// ✅ Password reset
router.post("/forgot", authController.forgotPassword);
router.post("/reset", authController.resetPassword);

// ✅ Test email (DEBUG ONLY)
router.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    
    const { sendCredentialsEmail } = require("../utils/emailService");
    await sendCredentialsEmail(email, "testpassword123");
    
    res.json({ success: true, message: "Test email sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ OTP (SAFE BINDING)
if (
  typeof authController.sendOtp === "function" &&
  typeof authController.verifyOtpAndReset === "function"
) {
  router.post("/send-otp", authController.sendOtp);
  router.post("/verify-otp", authController.verifyOtpAndReset);
} else {
  console.log("⚠️ OTP functions not loaded properly");
}

module.exports = router;
