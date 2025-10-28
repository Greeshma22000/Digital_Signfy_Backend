import Document from '../models/Document.js';

export const uploadDocument = async (req, res) => {
  try {
    console.log('📥 req.file:', req.file);      // debug uploaded file
    console.log('👤 req.user:', req.user);      // debug logged-in user

    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const document = new Document({
      fileName: file.filename,           // renamed by multer
      originalName: file.originalname,   // original user filename
      filePath: file.path.replace(/\\/g, '/'),  // ✅ Normalize path
                   
      uploadedBy: req.user._id           // from auth middleware
    });

    await document.save();

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });

  } catch (err) {
    console.error('❌ Upload failed:', err);
    res.status(500).json({ message: 'Upload failed', error: err.message });
  }
};

export const getAllDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ uploadedBy: req.user._id });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found' });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch document', error: err.message });
  }
};


import fs from 'fs';

export const cleanupDocs = async (req, res) => {
  try {
    const allDocs = await Document.find({});
    const removed = [];

    for (let doc of allDocs) {
      if (!fs.existsSync(doc.filePath)) {
        await Document.findByIdAndDelete(doc._id);
        removed.push(doc.fileName);
      }
    }

    res.json({ message: 'Cleanup complete', removed });
  } catch (err) {
    console.error('Cleanup error:', err);
    res.status(500).json({ message: 'Cleanup failed', error: err.message });
  }
};