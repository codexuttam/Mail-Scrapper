import mongoose from 'mongoose';

const LeadSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, index: true },
  name: { type: String, default: 'Unnamed Business' },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  website: { type: String },
  socials: {
    instagram: String,
    facebook: String,
    linkedin: String,
    twitter: String
  },
  location: { type: String },
  type: { type: String },
  status: { type: String, default: 'new' },
  message: { type: String },
  lastSentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

if (mongoose.models.Lead) {
  delete mongoose.models.Lead;
}
export default mongoose.model('Lead', LeadSchema);
