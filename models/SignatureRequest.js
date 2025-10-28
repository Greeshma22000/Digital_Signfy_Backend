import mongoose from 'mongoose';

const signatureRequestSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
  },
  recipientEmail: {
    type: String,
    required: true,
  },
  signerName: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['pending', 'signed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '48h'
  }
});

export default mongoose.model('SignatureRequest', signatureRequestSchema);