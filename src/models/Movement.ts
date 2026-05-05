import mongoose from 'mongoose';

const MovementSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true },
  assetId: { type: String, required: true },
  item: { type: String, required: true },
  reason: { type: String, required: true },
  exitDate: { type: Date, default: Date.now },
  requiresReturn: { type: Boolean, default: true },
  expectedReturn: { type: Date },
  responsible: { type: String, required: true },
  origin: { type: String, required: true },
  sender: { type: String, required: true },
  status: { type: String, enum: ['OUT', 'RETURNED'], default: 'OUT' },
  actualReturnDate: { type: Date },
}, { timestamps: true });

export default mongoose.models.Movement || mongoose.model('Movement', MovementSchema);
