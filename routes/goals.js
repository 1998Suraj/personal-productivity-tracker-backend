import express from 'express';
import chalk from 'chalk';
import Goal from '../models/Goal.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all goals for user
router.get('/', authenticateToken, async (req, res) => {
  console.log(chalk.blue('🎯 [GOALS] Get all goals request received for user:'), chalk.cyan(req.user._id));
  
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    console.log(chalk.green('✅ [GOALS] Retrieved goals successfully for user:'), chalk.cyan(req.user._id), chalk.yellow('Count:'), goals.length);
    res.json(goals);
  } catch (error) {
    console.error(chalk.red('❌ [GOALS] Get goals error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new goal
router.post('/', authenticateToken, async (req, res) => {
  console.log(chalk.blue('🎯 [GOALS] Create goal request received for user:'), chalk.cyan(req.user._id), chalk.gray('Goal data:'), req.body);
  
  try {
    const goalData = { ...req.body, userId: req.user._id };
    const goal = new Goal(goalData);
    await goal.save();
    console.log(chalk.green('✅ [GOALS] Goal created successfully:'), { goalId: goal._id, userId: req.user._id });
    res.status(201).json(goal);
  } catch (error) {
    console.error(chalk.red('❌ [GOALS] Create goal error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update goal
router.put('/:id', authenticateToken, async (req, res) => {
  console.log(chalk.blue('🎯 [GOALS] Update goal request received:'), { goalId: req.params.id, userId: req.user._id, updateData: req.body });
  
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!goal) {
      console.log(chalk.red('❌ [GOALS] Goal not found for update:'), { goalId: req.params.id, userId: req.user._id });
      return res.status(404).json({ message: 'Goal not found' });
    }
    console.log(chalk.green('✅ [GOALS] Goal updated successfully:'), { goalId: goal._id, userId: req.user._id });
    res.json(goal);
  } catch (error) {
    console.error(chalk.red('❌ [GOALS] Update goal error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete goal
router.delete('/:id', authenticateToken, async (req, res) => {
  console.log(chalk.blue('🎯 [GOALS] Delete goal request received:'), { goalId: req.params.id, userId: req.user._id });
  
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) {
      console.log(chalk.red('❌ [GOALS] Goal not found for deletion:'), { goalId: req.params.id, userId: req.user._id });
      return res.status(404).json({ message: 'Goal not found' });
    }
    console.log(chalk.green('✅ [GOALS] Goal deleted successfully:'), { goalId: req.params.id, userId: req.user._id });
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error(chalk.red('❌ [GOALS] Delete goal error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;