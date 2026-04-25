import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema({
  userEmail: { type: String, unique: true, required: true },
  fullName: { type: String },
  email: { type: String },
  googleMapsApiKey: { type: String },
  openaiApiKey: { type: String },
  leadAlerts: { type: Boolean, default: true },
  outreachAlerts: { type: Boolean, default: true },
  milestoneAlerts: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now }
});

// Since we only expect one settings object for now, we can just use a fixed ID or findOne
if (mongoose.models.Settings) {
  delete mongoose.models.Settings;
}
export default mongoose.model('Settings', SettingsSchema);
