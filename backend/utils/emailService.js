const nodemailer = require('nodemailer');

/**
 * Check whether valid SMTP configuration is present in environment
 */
const isSmtpConfigured = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;
  return !!(host && host.trim() !== '' && user && user.trim() !== '' && pass && pass.trim() !== '');
};

const getTransporter = () => {
  if (!isSmtpConfigured()) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    family: 4,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

exports.isSmtpConfigured = isSmtpConfigured;

/**
 * Send 6-digit verification OTP to applicant after Admin approval
 */
exports.sendVerificationOtpEmail = async (toEmail, recipientName, otp) => {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      message: 'OTP generated successfully, but real email delivery cannot be verified until SMTP is configured.'
    };
  }

  try {
    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"EduConnect Pro" <${process.env.SMTP_USER || 'no-reply@educonnect.com'}>`;
    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject: 'EduConnect Pro Email Verification Code',
      text: `Hello ${recipientName || 'Applicant'},\n\nYour registration for EduConnect Pro has been approved by an administrator!\n\nPlease enter the following 6-digit verification code to activate your account:\n\n${otp}\n\nThis verification code will expire in 10 minutes.\n\nThank you,\nEduConnect Pro Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">EduConnect Pro Email Verification</h2>
          <p>Hello <strong>${recipientName || 'Applicant'}</strong>,</p>
          <p>Great news! Your registration request has been <strong>approved</strong> by the administrator.</p>
          <p>To continue your registration, please enter the following 6-digit verification code in EduConnect Pro:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">This code will expire in 10 minutes. If you did not apply, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">EduConnect Pro - Modern E-Learning & Campus Platform</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    return { sent: false, message: `Email delivery failed: ${error.message}` };
  }
};

/**
 * Send 6-digit password reset OTP
 */
exports.sendPasswordResetOtpEmail = async (toEmail, recipientName, otp) => {
  if (!isSmtpConfigured()) {
    return {
      sent: false,
      message: 'EMAIL CONFIGURATION REQUIRED'
    };
  }

  try {
    const transporter = getTransporter();
    const fromAddress = process.env.SMTP_FROM || `"EduConnect Pro" <${process.env.SMTP_USER || 'no-reply@educonnect.com'}>`;
    const mailOptions = {
      from: fromAddress,
      to: toEmail,
      subject: 'EduConnect Pro Password Reset Code',
      text: `Hello ${recipientName || 'User'},\n\nA password reset request was received for your EduConnect Pro account.\n\nYour 6-digit verification code is:\n\n${otp}\n\nThis verification code will expire in 15 minutes.\n\nIf you did not request this, please secure your account immediately.\n\nThank you,\nEduConnect Pro Team`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #4f46e5; margin-top: 0;">Password Reset Code</h2>
          <p>Hello <strong>${recipientName || 'User'}</strong>,</p>
          <p>A request was received to reset the password for your EduConnect Pro account.</p>
          <p>Use the following 6-digit verification code to proceed:</p>
          <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #4f46e5;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">This code will expire in 15 minutes. If you did not request a reset, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #94a3b8;">EduConnect Pro - Modern E-Learning & Campus Platform</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    return { sent: false, message: `Email delivery failed: ${error.message}` };
  }
};
