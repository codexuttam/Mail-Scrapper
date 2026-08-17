import mongoose from 'mongoose';

const ScrapeCacheSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  results: {
    type: Array,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 604800 // Automatically delete documents after 7 days (7 * 24 * 60 * 60)
  }
});

export default mongoose.models.ScrapeCache || mongoose.model('ScrapeCache', ScrapeCacheSchema);
