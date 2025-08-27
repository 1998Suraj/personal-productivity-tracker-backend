import express from 'express';
import chalk from 'chalk';
import Topic from '../models/Topic.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all topics for user
router.get('/', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📚 [TOPICS] Get all topics request received for user:'), chalk.cyan(req.user._id), chalk.gray('Query params:'), req.query);
  
  try {
    const { category, status, search } = req.query;
    let query = { userId: req.user._id };

    if (category) query.category = category;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { associatedTags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const topics = await Topic.find(query).sort({ createdAt: -1 });
    console.log(chalk.green('✅ [TOPICS] Retrieved topics successfully for user:'), chalk.cyan(req.user._id), chalk.yellow('Count:'), topics.length);
    res.json(topics);
  } catch (error) {
    console.error(chalk.red('❌ [TOPICS] Get topics error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new topic
router.post('/', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📚 [TOPICS] Create topic request received for user:'), chalk.cyan(req.user._id), chalk.gray('Topic data:'), req.body);
  
  try {
    const topicData = { ...req.body, userId: req.user._id };
    const topic = new Topic(topicData);
    await topic.save();
    console.log(chalk.green('✅ [TOPICS] Topic created successfully:'), { topicId: topic._id, userId: req.user._id, name: topic.name });
    res.status(201).json(topic);
  } catch (error) {
    console.error(chalk.red('❌ [TOPICS] Create topic error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update topic
router.put('/:id', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📚 [TOPICS] Update topic request received:'), { goalId: req.params.id, userId: req.user._id, updateData: req.body });
  
  try {
    const topic = await Topic.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!topic) {
      console.log(chalk.red('❌ [TOPICS] Topic not found for update:'), { topicId: req.params.id, userId: req.user._id });
      return res.status(404).json({ message: 'Topic not found' });
    }
    console.log(chalk.green('✅ [TOPICS] Topic updated successfully:'), { topicId: topic._id, userId: req.user._id, name: topic.name });
    res.json(topic);
  } catch (error) {
    console.error(chalk.red('❌ [TOPICS] Update topic error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete topic
router.delete('/:id', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📚 [TOPICS] Delete topic request received:'), { topicId: req.params.id, userId: req.user._id });
  
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!topic) {
      console.log(chalk.red('❌ [TOPICS] Topic not found for deletion:'), { topicId: req.params.id, userId: req.user._id });
      return res.status(404).json({ message: 'Topic not found' });
    }
    console.log(chalk.green('✅ [TOPICS] Topic deleted successfully:'), { topicId: req.params.id, userId: req.user._id, name: topic.name });
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error(chalk.red('❌ [TOPICS] Delete topic error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get topic by ID
router.get('/:id', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📚 [TOPICS] Get topic by ID request received:'), { topicId: req.params.id, userId: req.user._id });
  
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id });
    if (!topic) {
      console.log(chalk.red('❌ [TOPICS] Topic not found:'), { topicId: req.params.id, userId: req.user._id });
      return res.status(404).json({ message: 'Topic not found' });
    }
    console.log(chalk.green('✅ [TOPICS] Topic retrieved successfully:'), { topicId: topic._id, userId: req.user._id, name: topic.name });
    res.json(topic);
  } catch (error) {
    console.error(chalk.red('❌ [TOPICS] Get topic by ID error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update subtopic
router.put('/:id/subtopics/:subtopicId', authenticateToken, async (req, res) => {
  console.log(chalk.blue('📚 [TOPICS] Update subtopic request received:'), { 
    topicId: req.params.id, 
    subtopicId: req.params.subtopicId, 
    userId: req.user._id, 
    updateData: req.body 
  });
  
  try {
    const topic = await Topic.findOne({ _id: req.params.id, userId: req.user._id });
    if (!topic) {
      console.log(chalk.red('❌ [TOPICS] Topic not found for subtopic update:'), { topicId: req.params.id, userId: req.user._id });
      return res.status(404).json({ message: 'Topic not found' });
    }

    const subtopic = topic.subtopics.id(req.params.subtopicId);
    if (!subtopic) {
      console.log(chalk.red('❌ [TOPICS] Subtopic not found:'), { topicId: req.params.id, subtopicId: req.params.subtopicId, userId: req.user._id });
      return res.status(404).json({ message: 'Subtopic not found' });
    }

    Object.assign(subtopic, req.body);
    await topic.save();
    console.log(chalk.green('✅ [TOPICS] Subtopic updated successfully:'), { 
      topicId: topic._id, 
      subtopicId: req.params.subtopicId, 
      userId: req.user._id 
    });
    res.json(topic);
  } catch (error) {
    console.error(chalk.red('❌ [TOPICS] Update subtopic error:'), chalk.red(error.message));
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;