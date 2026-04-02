const { Resend } = require("resend");
const nodemailer = require("nodemailer");

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const gmailTransporter = process.env.GMAIL_USER && process.env.GMAIL_PASS
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    })
  : null;

const smtpTransporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

const isDev = process.env.NODE_ENV !== 'production';

const getEtherealTransporter = async () => {
  if (global.__etherealTransporter) {
    return global.__etherealTransporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  global.__etherealTransporter = transporter;
  console.log('🧪 Ethereal test SMTP account created:', testAccount.user);
  console.log('🧪 Builder: In test environment, URLs for sent emails are in console output.');
  return transporter;
};

const getFallbackTransporter = async () => {
  if (smtpTransporter) {
    return { transporter: smtpTransporter, type: 'smtp' };
  }
  if (gmailTransporter) {
    return { transporter: gmailTransporter, type: 'gmail' };
  }
  if (isDev) {
    const transporter = await getEtherealTransporter();
    return { transporter, type: 'ethereal' };
  }
  return null;
};

const sendResetPasswordEmail = async (email, token, name) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM,
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
    });

    console.log(`✅ Reset email sent to ${email}`);
  } catch (error) {
    console.error("❌ Resend error:", error);
    throw new Error("Failed to send reset email");
  }
};

const sendOtpEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your OTP Code</h2>
        <h1>${otp}</h1>
        <p>This OTP expires in 10 minutes.</p>
      `,
    });

    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ OTP send failed:", error);
    throw new Error("Failed to send OTP");
  }
};

const sendCredentialsEmail = async (email, password) => {
  if (!process.env.RESEND_API_KEY && !gmailTransporter && !isDev) {
    throw new Error("Email service not configured: RESEND_API_KEY or GMAIL credentials missing");
  }

  if (!process.env.EMAIL_FROM && !process.env.GMAIL_USER) {
    throw new Error("Email service not configured: EMAIL_FROM or GMAIL_USER missing");
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  try {
    if (resend && process.env.EMAIL_FROM) {
      try {
        const result = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: email,
          subject: "Your Account Credentials",
          html: `
            <h2>Welcome to SRITP</h2>
            <p>Your account has been created.</p>
            <p><b>Email:</b> ${email}</p>
            <p><b>Password:</b> ${password}</p>
            <p>Please login and change your password.</p>
            <p><small>This is an auto-generated account. Login at ${clientUrl}/login</small></p>
          `,
        });

        if (result && result.id) {
          console.log(`✅ Credentials email sent to ${email} via Resend`, { resendId: result.id });
          return result;
        }

        console.warn(`⚠️ Resend returned no email ID. Result:`, result);
        throw new Error('Resend failed to return email ID');
      } catch (resendError) {
        console.warn(`⚠️ Resend failed for ${email}:`, resendError?.message || resendError);
      }
    }

    const fallback = await getFallbackTransporter();
    if (!fallback) {
      throw new Error('No email transporter available for fallback');
    }

    const fromAddress =
      process.env.EMAIL_FROM ||
      process.env.GMAIL_USER ||
      process.env.SMTP_USER ||
      'no-reply@example.com';

    const mailOptions = {
      from: fromAddress,
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

    const sendResult = await fallback.transporter.sendMail(mailOptions);

    if (fallback.type === 'ethereal') {
      const previewUrl = nodemailer.getTestMessageUrl(sendResult);
      console.log(`✅ Credentials email sent to ${email} via Ethereal SMTP (dev)`, { messageId: sendResult.messageId, previewUrl });
      console.log(`🖥️ Preview URL: ${previewUrl}`);
      return { id: sendResult.messageId, method: 'ethereal', previewUrl };
    }

    console.log(`✅ Credentials email sent to ${email} via ${fallback.type} SMTP`, { messageId: sendResult.messageId });
    return { id: sendResult.messageId, method: fallback.type };

  } catch (error) {
    console.error("❌ Credentials email FAILED for", email);
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Full error:", {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode || 'N/A',
    });
    throw error;
  }
};

module.exports = {
  sendResetPasswordEmail,
  sendOtpEmail,
  sendCredentialsEmail
};
