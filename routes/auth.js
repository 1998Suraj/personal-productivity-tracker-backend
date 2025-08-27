import express from 'express';
import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  console.log(chalk.blue('🔐 [AUTH] Register request received:'), { email: req.body.email, name: req.body.name });
  
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      console.log(chalk.red('❌ [AUTH] Register failed - Missing required fields'));
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(chalk.red('❌ [AUTH] Register failed - User already exists:'), chalk.yellow(email));
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({ email, password, name });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(chalk.green('✅ [AUTH] Register successful:'), { userId: user._id, email: user.email });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        startDate: user.startDate,
        settings: user.settings,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error(chalk.red('❌ [AUTH] Register error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  console.log(chalk.blue('🔐 [AUTH] Login request received:'), { email: req.body.email });
  
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log(chalk.red('❌ [AUTH] Login failed - Missing credentials'));
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      console.log(chalk.red('❌ [AUTH] Login failed - Invalid credentials for:'), chalk.yellow(email));
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(chalk.green('✅ [AUTH] Login successful:'), { userId: user._id, email: user.email });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        startDate: user.startDate,
        settings: user.settings,
        stats: user.stats
      }
    });
  } catch (error) {
    console.error(chalk.red('❌ [AUTH] Login error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  console.log(chalk.blue('👤 [AUTH] Get profile request received for user:'), chalk.cyan(req.user._id));
  
  try {
    const user = req.user;
    console.log(chalk.green('✅ [AUTH] Profile retrieved successfully for user:'), chalk.cyan(user._id));
    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      startDate: user.startDate,
      settings: user.settings,
      stats: user.stats
    });
  } catch (error) {
    console.error(chalk.red('❌ [AUTH] Get profile error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user settings
router.put('/settings', authenticateToken, async (req, res) => {
  console.log(chalk.blue('⚙️ [AUTH] Update settings request received for user:'), chalk.cyan(req.user._id), 'Settings:', req.body.settings);
  
  try {
    const { settings } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { settings } },
      { new: true }
    );
    console.log(chalk.green('✅ [AUTH] Settings updated successfully for user:'), chalk.cyan(req.user._id));
    res.json(user.settings);
  } catch (error) {
    console.error(chalk.red('❌ [AUTH] Update settings error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;