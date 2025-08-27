import mongoose from 'mongoose';

const dailyLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  questionsSolved: { type: Number, default: 0 },
  timeStudied: { type: Number, default: 0 }, // in minutes
  notes: String,
  linkedTopics: [{
    topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
    subtopicName: String,
    questionsCount: Number
  }],
  mood: {
    type: String,
    enum: ['Excellent', 'Good', 'Average', 'Below Average', 'Poor']
  },
  achievements: [String]
}, {
  timestamps: true
});

// Create compound index for userId and date
dailyLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('DailyLog', dailyLogSchema);