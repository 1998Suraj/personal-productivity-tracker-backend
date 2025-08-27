import jwt from 'jsonwebtoken';
import chalk from 'chalk';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log(chalk.red('🔒 [AUTH] Authentication failed - No token provided for path:'), chalk.gray(req.path));
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log(chalk.red('🔒 [AUTH] Authentication failed - User not found for token:'), { userId: decoded.userId, path: req.path });
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    console.log(chalk.green('✅ [AUTH] Authentication successful for user:'), { userId: user._id, email: user.email, path: req.path });
    next();
  } catch (error) {
    console.log(chalk.red('🔒 [AUTH] Authentication failed - Invalid/expired token for path:'), chalk.gray(req.path), chalk.red('Error:'), error.message);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};