import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true
  },
  originalName: {
     type: String 
    },
  filePath: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Document', documentSchema);