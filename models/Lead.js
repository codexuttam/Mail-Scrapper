import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  location: { type: String },
  type: { type: String },
  status: { type: String, default: 'new' },
  message: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Lead || mongoose.model('Lead', LeadSchema);
