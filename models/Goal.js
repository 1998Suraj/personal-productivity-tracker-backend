import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  targetDate: {
    type: Date,
    required: true
  },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Paused', 'Cancelled'],
    default: 'Active'
  },
  milestones: [{
    title: String,
    targetDate: Date,
    completed: { type: Boolean, default: false },
    completedDate: Date
  }]
}, {
  timestamps: true
});

export default mongoose.model('Goal', goalSchema);