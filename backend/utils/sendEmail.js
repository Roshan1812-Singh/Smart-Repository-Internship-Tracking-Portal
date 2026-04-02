const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

const sendCredentialsEmail = async (email, password) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Account Credentials',
    html: `
      <h2>Welcome to SRITP</h2>
      <p>Your account has been created.</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Password:</b> ${password}</p>
      <p>Please login and change your password.</p>
      <p><small>This is an auto-generated account. Login at ${clientUrl}/login</small></p>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Credentials email sent to ${email}`, { messageId: result.messageId });
    return result;
  } catch (error) {
    console.error("❌ Credentials email FAILED for", email);
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    throw error;
  }
};

const sendResetPasswordEmail = async (email, token, name) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial;">
        <h2>Hello ${name}</h2>
        <p>You requested a password reset.</p>
        <a href="${resetUrl}" style="padding:10px 20px;background:#4f46e5;color:white;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${email}`, { messageId: result.messageId });
    return result;
  } catch (error) {
    console.error("❌ Reset email FAILED for", email);
    throw error;
  }
};

const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    html: `
      <h2>Your OTP Code</h2>
      <h1>${otp}</h1>
      <p>This OTP expires in 10 minutes.</p>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`, { messageId: result.messageId });
    return result;
  } catch (error) {
    console.error("❌ OTP send failed:", error);
    throw error;
  }
};

module.exports = {
  sendCredentialsEmail,
  sendResetPasswordEmail,
  sendOtpEmail
};