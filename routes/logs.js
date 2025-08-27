import express from 'express';
import chalk from 'chalk';
import DailyLog from '../models/DailyLog.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get daily logs
router.get('/', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📊 [LOGS] Get daily logs request received for user:'), chalk.cyan(req.user._id), chalk.gray('Query params:'), req.query);
  
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    let query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await DailyLog.find(query)
      .populate('linkedTopics.topicId', 'name category')
      .sort({ date: -1 })
      .limit(parseInt(limit));

    console.log(chalk.green('✅ [LOGS] Retrieved daily logs successfully for user:'), chalk.cyan(req.user._id), chalk.yellow('Count:'), logs.length);
    res.json(logs);
  } catch (error) {
    console.error(chalk.red('❌ [LOGS] Get daily logs error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or update daily log
router.post('/', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📊 [LOGS] Create/update daily log request received for user:'), chalk.cyan(req.user._id), chalk.gray('Log data:'), req.body);
  
  try {
    const logData = { ...req.body, userId: req.user._id };
    const date = new Date(logData.date);
    date.setHours(0, 0, 0, 0);

    const log = await DailyLog.findOneAndUpdate(
      { userId: req.user._id, date },
      logData,
      { new: true, upsert: true }
    );

    // Update user stats
    if (logData.questionsSolved > 0) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'stats.totalQuestions': logData.questionsSolved }
      });
      console.log(chalk.magenta('📈 [LOGS] Updated user stats - questions solved:'), chalk.yellow(logData.questionsSolved));
    }

    console.log(chalk.green('✅ [LOGS] Daily log created/updated successfully:'), { logId: log._id, userId: req.user._id, date: log.date });
    res.json(log);
  } catch (error) {
    console.error(chalk.red('❌ [LOGS] Create/update daily log error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get streak information
router.get('/streak', authenticateToken, async (req, res) => {
  console.log(chalk.blue('🔥 [LOGS] Get streak request received for user:'), chalk.cyan(req.user._id));
  
  try {
    const logs = await DailyLog.find({ 
      userId: req.user._id,
      questionsSolved: { $gt: 0 }
    }).sort({ date: -1 }).limit(365);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate current streak
    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      const daysDiff = Math.floor((today - logDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === i) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    for (let i = 0; i < logs.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const currentDate = new Date(logs[i].date);
        const prevDate = new Date(logs[i - 1].date);
        const daysDiff = Math.floor((prevDate - currentDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      'stats.currentStreak': currentStreak,
      'stats.longestStreak': longestStreak
    });

    console.log(chalk.green('✅ [LOGS] Streak calculated successfully:'), { userId: req.user._id, currentStreak, longestStreak });
    res.json({ currentStreak, longestStreak });
  } catch (error) {
    console.error(chalk.red('❌ [LOGS] Get streak error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📈 [LOGS] Get analytics request received for user:'), chalk.cyan(req.user._id), chalk.gray('Period:'), req.query.period);
  
  try {
    const { period = '30' } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    const logs = await DailyLog.find({
      userId: req.user._id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    const analytics = {
      totalQuestions: logs.reduce((sum, log) => sum + (log.questionsSolved || 0), 0),
      totalTime: logs.reduce((sum, log) => sum + (log.timeStudied || 0), 0),
      averageQuestions: logs.length > 0 ? logs.reduce((sum, log) => sum + (log.questionsSolved || 0), 0) / logs.length : 0,
      studyDays: logs.filter(log => (log.questionsSolved || 0) > 0).length,
      dailyData: logs.map(log => ({
        date: log.date,
        questions: log.questionsSolved || 0,
        time: log.timeStudied || 0
      }))
    };

    console.log(chalk.green('✅ [LOGS] Analytics calculated successfully:'), { 
      userId: req.user._id, 
      period, 
      totalQuestions: analytics.totalQuestions,
      studyDays: analytics.studyDays 
    });
    res.json(analytics);
  } catch (error) {
    console.error(chalk.red('❌ [LOGS] Get analytics error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;