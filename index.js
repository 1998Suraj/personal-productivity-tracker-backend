import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import chalk from 'chalk';
import authRoutes from './routes/auth.js';
import topicRoutes from './routes/topics.js';
import logRoutes from './routes/logs.js';
import goalRoutes from './routes/goals.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  console.log(chalk.yellow('⚠️  [SERVER] JWT_SECRET not found in environment variables, using fallback secret'));
  process.env.JWT_SECRET = 'fallback-jwt-secret-change-in-production';
}

// Middleware
app.use(cors({
  origin: "*", // allow all origins
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Request logging middleware with colors
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;
  
  // Color coding based on HTTP method
  let methodColor;
  switch (method) {
    case 'GET':
      methodColor = chalk.green;
      break;
    case 'POST':
      methodColor = chalk.blue;
      break;
    case 'PUT':
      methodColor = chalk.yellow;
      break;
    case 'DELETE':
      methodColor = chalk.red;
      break;
    default:
      methodColor = chalk.gray;
  }
  
  console.log(chalk.cyan(`🌐 [SERVER] ${methodColor(method)} ${path} - ${chalk.gray(timestamp)}`));
  next();
});

// Connect to MongoDB
console.log(chalk.blue('🔌 [SERVER] Attempting to connect to MongoDB...'));
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://surajkarosia98:bhXo4D6OXUf0dMFF@cluster0.jsyqafl.mongodb.net/personal-productivity-tracker')
  .then(() => {
    console.log(chalk.green('✅ [SERVER] Connected to MongoDB successfully'));
  })
  .catch((error) => {
    console.error(chalk.red('❌ [SERVER] MongoDB connection error:'), chalk.red(error.message));
  });

// Routes
console.log(chalk.blue('🚀 [SERVER] Setting up API routes...'));
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
console.log(chalk.green('✅ [SERVER] API routes configured successfully'));

app.listen(PORT, () => {
  console.log(chalk.green(`🚀 [SERVER] Server running on port ${chalk.bold(PORT)}`));
  console.log(chalk.cyan(`📡 [SERVER] API endpoints available at http://localhost:${PORT}/api`));
});
