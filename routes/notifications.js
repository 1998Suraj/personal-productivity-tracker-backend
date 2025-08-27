import express from 'express';
import chalk from 'chalk';
import nodemailer from 'nodemailer';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send reminder email
router.post('/reminder', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📧 [NOTIFICATIONS] Send reminder request received for user:'), chalk.cyan(req.user._id), chalk.gray('Reminder data:'), req.body);
  
  try {
    const { email, name } = req.user;
    const { type, message } = req.body;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Gen AI Learning Reminder - ${type}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Hello ${name}!</h2>
          <p>${message || 'Time to continue your Gen AI learning journey!'}</p>
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Your Learning Progress</h3>
            <p>Keep up the momentum and reach your goal of becoming a Gen AI developer!</p>
          </div>
          <p style="color: #6B7280;">This reminder was sent from your Productivity Tracker app.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(chalk.green('✅ [NOTIFICATIONS] Reminder email sent successfully:'), { userId: req.user._id, email, type });
    res.json({ message: 'Reminder sent successfully' });
  } catch (error) {
    console.error(chalk.red('❌ [NOTIFICATIONS] Send reminder error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Error sending reminder', error: error.message });
  }
});

export default router;