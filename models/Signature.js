import mongoose from 'mongoose';

const signatureSchema = new mongoose.Schema({
  documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  page: { type: Number, required:true },

  name: { type: String, required: true },
  font: { type: String, required: true },
  fontSize: { type: Number, default: 24 },

}, { timestamps: true });

const Signature = mongoose.model('Signature', signatureSchema);
export default Signature; // ✅ ESM-compatible export


