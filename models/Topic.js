import mongoose from 'mongoose';

const subtopicSchema = new mongoose.Schema({
  name: String,
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  startDate: Date,
  endDate: Date,
  timeSpent: { type: Number, default: 0 }, // in hours
  notes: String
});

const topicSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['DSA', 'System Design', 'Design Patterns', 'Generative AI', 'Agentic AI'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  subtopics: [subtopicSchema],
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started'
  },
  startDate: Date,
  endDate: Date,
  timeSpent: { type: Number, default: 0 }, // in hours
  associatedTags: [String],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  resources: [{
    title: String,
    url: String,
    type: { type: String, enum: ['Link', 'Video', 'Article', 'Book'] }
  }],
  progress: { type: Number, default: 0, min: 0, max: 100 }
}, {
  timestamps: true
});

export default mongoose.model('Topic', topicSchema);