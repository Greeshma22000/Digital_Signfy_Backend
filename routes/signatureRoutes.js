import express from 'express';
import Signature from '../models/Signature.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { applySignature } from '../controllers/signatureController.js';
import SignatureRequest from '../models/SignatureRequest.js';
import { sendSignatureRequestEmail } from '../utils/email.js';
import { v4 as uuidv4 } from 'uuid';


const router = express.Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { documentId, x, y, page,name,font , fontSize} = req.body;
    const userId = req.user.id;


    console.log('📥 Signature POST payload:', req.body);
    console.log('🔐 User ID from token:', userId);

    if (!name || !font || !page || !documentId  || fontSize === undefined) {
      return res.status(400).json({ error: 'Missing signature details' });
    }

    const parsedFontSize = Number(fontSize);
    if (isNaN(parsedFontSize) || parsedFontSize <= 0) {
      return res.status(400).json({ error: 'Invalid font size' });
    }
    await Signature.deleteMany({ documentId, userId }); // remove previous signatures
    const signature = new Signature({ documentId, userId, x, y, page,name,font,fontSize :parsedFontSize});
    await signature.save();
    res.status(201).json(signature);
  } catch (err) {
    console.error('❌ Signature save error:', err);
    console.log('📥 Signature POST payload:', req.body);

    res.status(500).json({ error: 'Error saving signature' });
  }
});

router.get('/apply/:documentId', authMiddleware, applySignature);



// Send external signature request
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { documentId, recipientEmail, signerName } = req.body;
    const token = uuidv4();

    const newRequest = new SignatureRequest({
      documentId,
      recipientEmail,
      signerName,
      token
    });

    await newRequest.save();

    // ✅ Use your live frontend URL
    const signUrl = `https://digital-signfy-frontend.vercel.app/${token}`;
    await sendSignatureRequestEmail(recipientEmail, signerName, signUrl, token); // ✅ token passed

    res.status(200).json({ message: 'Signature request sent', token });
  } catch (err) {
    console.error('❌ Signature request error:', err);
    res.status(500).json({ error: 'Failed to send signature request' });
  }
});


// Fetch pending signature request by token
router.get('/pending/:token', async (req, res) => {
  try {
    const token = req.params.token;
    const request = await SignatureRequest.findOne({ token, status: 'pending' }).populate('documentId');
    if (!request) return res.status(404).json({ error: 'Invalid or expired token' });

    res.json({
      signerName: request.signerName,
      filePath: request.documentId?.filePath,
      documentId: request.documentId?._id
    });
  } catch (err) {
    console.error('❌ Fetch token error:', err);
    res.status(500).json({ error: 'Failed to fetch signature request' });
  }
});

// Complete the signature (store & apply it)
router.post('/complete/:token', async (req, res) => {
  try {
    const { x, y, page, name, font, fontSize } = req.body;
    const token = req.params.token;

    const request = await SignatureRequest.findOne({ token, status: 'pending' });
    if (!request) return res.status(404).json({ error: 'Invalid or used token' });

    // Save signature
    const newSig = new SignatureModel({
      documentId: request.documentId,
      userId: null,
      x, y, page, name, font, fontSize
    });
    await newSig.save();

    // Apply signature to PDF
    req.params.documentId = request.documentId.toString(); // re-use existing applySignature()
    await applySignature(req, res);

    request.status = 'signed';
    await request.save();
  } catch (err) {
    console.error('❌ Signature completion error:', err);
    res.status(500).json({ error: 'Failed to complete signature' });
  }
});


export default router; // ✅ default export