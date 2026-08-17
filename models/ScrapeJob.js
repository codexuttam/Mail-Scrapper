import mongoose from 'mongoose';

const ScrapeJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  query: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: String,
    default: 'Starting job...'
  },
  results: {
    type: Array,
    default: []
  },
  saved: {
    type: Array,
    default: []
  },
  error: {
    type: String,
    default: null
  },
  userEmail: {
    type: String,
    required: true
  },
  saveToDb: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Delete jobs after 24 hours
  }
});

export default mongoose.models.ScrapeJob || mongoose.model('ScrapeJob', ScrapeJobSchema);
