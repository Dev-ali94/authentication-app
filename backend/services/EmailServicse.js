const nodemailer = require("nodemailer");
require('dotenv').config()

// Create an transporte to send otp 
const transporter = nodemailer.createTransport({
  service: "gmail",
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});
// html of otpbox
const OtpMessageBox = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #2563eb;">Email Verification</h2>
    <p>Your verification code is:</p>
    <div style="background: #f3f4f6; padding: 10px; display: inline-block; 
        font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0;">
      ${otp}
    </div>
    <p>This code will expire in 10 minutes.</p>
    <p style="color: #6b7280; font-size: 12px;">
      If you didn't request this code, please ignore this email.
    </p>
  </div>
`;
// function to sendotp
exports.sendOtp = async (userEmail, otp) => {
  if (userEmail.toLowerCase() === process.env.EMAIL_USER.toLowerCase()) {
    console.log(`Not sending OTP to sender email: ${userEmail}`);
    return { status: 'skipped', message: 'Not sent to sender email' };
  }
  const mailOptions = {
    from: `"AskMe" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: 'Your Verification Code',
    html: OtpMessageBox(otp),
    text: `Your verification code is: ${otp}\nExpires in 10 minutes.`,
    headers: {
      'X-Auto-Response-Suppress': 'All',
      'Auto-Submitted': 'auto-generated'
    }
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${userEmail}`);
    return { status: 'sent', info };
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
}


exports.sendPasswordResetEmail = async (email, otp) => {
  // Skip if recipient is the sender email
  if (email.toLowerCase() === process.env.EMAIL_USER.toLowerCase()) {
    console.log(`[SKIPPED] Not sending password reset to sender email: ${email}`);
    return { status: 'skipped', message: 'Not sent to sender email' };
  }

  const mailOptions = {
    from: `"Auth System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your Password Reset Code',
    html: generateResetPasswordEmailHTML(otp),
    text: `Your password reset code is: ${otp}\nExpires in 10 minutes.`,
    headers: {
      'X-Auto-Response-Suppress': 'All',
      'Auto-Submitted': 'auto-generated'
    }
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SENT] Password reset email to ${email}`);
    return { status: 'sent', info };
  } catch (error) {
    console.error('[ERROR] Failed to send password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};
// HTML template for password reset emails
const generateResetPasswordEmailHTML = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #dc3545;">Password Reset</h2>
    <p>We received a request to reset your password.</p>
    <p>Your reset code is:</p>
    <div style="background: #f8d7da; padding: 10px; display: inline-block; 
        font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0;">
      ${otp}
    </div>
    <p>This code will expire in 10 minutes.</p>
    <p style="color: #6c757d; font-size: 12px;">
      If you didn't request this, please secure your account.
    </p>
  </div>
`;