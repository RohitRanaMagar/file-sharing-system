import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL_USER,
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
  },
});

// Verify transporter
export const verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready');
    return true;
  } catch (error) {
    console.error('Email service error:', error.message);
    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (to, name, token, baseUrl) => {
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'EasyShare'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify Your Email - EasyShare',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }
          .subtitle {
            font-size: 16px;
            color: #64748b;
            margin-top: 10px;
          }
          .content {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            margin-top: 30px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .greeting {
            font-size: 18px;
            color: #0f172a;
            margin-bottom: 20px;
          }
          .message {
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          }
          .link-fallback {
            margin-top: 20px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            word-break: break-all;
            font-family: monospace;
            font-size: 13px;
            color: #64748b;
          }
          .footer {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">📧</div>
            <h1 class="title">EasyShare</h1>
            <p class="subtitle">Secure File Sharing Platform</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${name},</div>
            <div class="message">
              Welcome to EasyShare! We're excited to have you on board. To ensure the security of your account, please verify your email address by clicking the button below.
            </div>
            
            <div class="button-container">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="message" style="font-size: 14px; color: #64748b;">
              If the button doesn't work, copy and paste this link into your browser:
            </div>
            <div class="link-fallback">
              ${verificationUrl}
            </div>
          </div>
          
          <div class="footer">
            <p>This verification link will expire in 24 hours.</p>
            <p style="margin-top: 10px;">If you didn't create an account, you can safely ignore this email.</p>
            <p style="margin-top: 20px; font-size: 12px;">© 2024 EasyShare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to EasyShare!

Hello ${name},

Please verify your email address by visiting this link:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

© 2024 EasyShare`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send verification email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (to, name, token, baseUrl) => {
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'EasyShare'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Reset Your Password - EasyShare',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
          }
          .logo {
            font-size: 48px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: 700;
            color: #0f172a;
            margin: 0;
          }
          .subtitle {
            font-size: 16px;
            color: #64748b;
            margin-top: 10px;
          }
          .content {
            background-color: #ffffff;
            border-radius: 16px;
            padding: 40px;
            margin-top: 30px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .greeting {
            font-size: 18px;
            color: #0f172a;
            margin-bottom: 20px;
          }
          .message {
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          }
          .link-fallback {
            margin-top: 20px;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            word-break: break-all;
            font-family: monospace;
            font-size: 13px;
            color: #64748b;
          }
          .footer {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 14px;
          }
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
          }
          .warning {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 16px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
            font-size: 14px;
            color: #92400e;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🔐</div>
            <h1 class="title">EasyShare</h1>
            <p class="subtitle">Secure File Sharing Platform</p>
          </div>
          
          <div class="content">
            <div class="greeting">Hello ${name},</div>
            <div class="message">
              We received a request to reset your password for your EasyShare account. If you made this request, click the button below to reset your password.
            </div>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <div class="divider"></div>
            
            <div class="warning">
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email or contact support if you're concerned about your account security.
            </div>
            
            <div class="divider"></div>
            
            <div class="message" style="font-size: 14px; color: #64748b;">
              If the button doesn't work, copy and paste this link into your browser:
            </div>
            <div class="link-fallback">
              ${resetUrl}
            </div>
          </div>
          
          <div class="footer">
            <p>This password reset link will expire in 1 hour.</p>
            <p style="margin-top: 10px;">If you didn't request this, you can safely ignore this email.</p>
            <p style="margin-top: 20px; font-size: 12px;">© 2024 EasyShare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Password Reset Request - EasyShare

Hello ${name},

We received a request to reset your password for your EasyShare account. If you made this request, visit this link to reset your password:

${resetUrl}

⚠️ This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

© 2024 EasyShare`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    throw error;
  }
};

// Send welcome email after verification
export const sendWelcomeEmail = async (to, name) => {
  const mailOptions = {
    from: `"${process.env.APP_NAME || 'EasyShare'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject: 'Welcome to EasyShare! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f8fafc;
            margin: 0;
            padding: 0;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .header {
            text-align: center;
            padding: 30px 0;
          }
          .logo {
            font-size: 64px;
            margin-bottom: 10px;
          }
          .title {
            font-size: 32px;
            font-weight: 800;
            background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin: 0;
          }
          .subtitle {
            font-size: 18px;
            color: #64748b;
            margin-top: 10px;
          }
          .content {
            background-color: #ffffff;
            border-radius: 20px;
            padding: 40px;
            margin-top: 30px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          }
          .welcome-title {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .message {
            color: #475569;
            margin-bottom: 30px;
            line-height: 1.8;
            font-size: 16px;
          }
          .features {
            display: grid;
            gap: 15px;
            margin: 30px 0;
          }
          .feature {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            background: #f8fafc;
            border-radius: 12px;
            border-left: 4px solid #6366f1;
          }
          .feature-icon {
            font-size: 24px;
          }
          .feature-text {
            color: #334155;
            font-weight: 500;
          }
          .button-container {
            text-align: center;
            margin: 40px 0;
          }
          .button {
            display: inline-block;
            padding: 18px 50px;
            background: linear-gradient(135deg, #6366f1 0%, #06b6d4 100%);
            color: #ffffff !important;
            text-decoration: none;
            border-radius: 14px;
            font-weight: 700;
            font-size: 18px;
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
            transition: all 0.3s ease;
          }
          .button:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 30px rgba(99, 102, 241, 0.5);
          }
          .footer {
            text-align: center;
            padding: 40px 20px;
            color: #94a3b8;
            font-size: 14px;
          }
          .social-links {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
          }
          .social-link {
            width: 40px;
            height: 40px;
            background: #f1f5f9;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          .social-link:hover {
            background: #6366f1;
            transform: translateY(-3px);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🎉</div>
            <h1 class="title">Welcome to EasyShare!</h1>
            <p class="subtitle">Your secure file sharing journey begins now</p>
          </div>
          
          <div class="content">
            <div class="welcome-title">
              <span>👋</span>
              <span>Hello, ${name}!</span>
            </div>
            
            <div class="message">
              Thank you for joining EasyShare! We're thrilled to have you as part of our community. Your account is now fully activated and ready to use.
            </div>
            
            <div class="features">
              <div class="feature">
                <span class="feature-icon">📁</span>
                <span class="feature-text">Upload and manage files up to 2GB</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔗</span>
                <span class="feature-text">Share files with secure links</span>
              </div>
              <div class="feature">
                <span class="feature-icon">🔒</span>
                <span class="feature-text">End-to-end encryption</span>
              </div>
            </div>
            
            <div class="button-container">
              <a href="${baseUrl}/dashboard" class="button">Go to Dashboard</a>
            </div>
            
            <div class="message" style="font-size: 14px; text-align: center; color: #64748b; margin-top: 20px;">
              Need help? Contact our support team at support@easyshare.com
            </div>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="#" class="social-link">📧</a>
              <a href="#" class="social-link">💬</a>
              <a href="#" class="social-link">🐦</a>
            </div>
            <p>Thank you for choosing EasyShare!</p>
            <p style="margin-top: 10px;">You're receiving this email because you recently created an account on EasyShare.</p>
            <p style="margin-top: 20px; font-size: 12px;">© 2024 EasyShare. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to EasyShare, ${name}!

Thank you for joining EasyShare! Your account is now fully activated and ready to use.

Here's what you can do:
- Upload and manage files up to 2GB
- Share files with secure links
- Enjoy end-to-end encryption

Get started: ${baseUrl}/dashboard

Need help? Contact our support team at support@easyshare.com

© 2024 EasyShare. All rights reserved.`,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    throw error;
  }
};

export default {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
  verifyEmailConnection,
};
