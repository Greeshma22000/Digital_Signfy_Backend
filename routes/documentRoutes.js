import express from 'express';
import protect from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { uploadDocument, getAllDocuments, getDocumentById,cleanupDocs } from '../controllers/documentController.js';

const router = express.Router();

router.get('/cleanup', protect,cleanupDocs);
router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getAllDocuments);
router.get('/:id', protect, getDocumentById);


router.get('/:id', protect, getDocumentById);
//router.get('/cleanup', protect,cleanupDocs); // No auth protection needed (for testing)


export default router;