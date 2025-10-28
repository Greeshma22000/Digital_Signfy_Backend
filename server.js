import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import fs from 'fs';

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//import authRoutes from './routes/authRoutes.js';

//import signatureRoutes from './routes/signatureRoutes.js';

const app = express();

const uploadsPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

const allowedOrigins = [
  'http://localhost:5173',
  'https://digital-signfy-frontend.vercel.app'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(express.json());

import authRoutes from './routes/authRoutes.js';

import signatureRoutes from './routes/signatureRoutes.js';

app.use('/api/auth', authRoutes);





const PORT = process.env.PORT || 5000;

// Temporary root route
app.get('/', (req, res) => {
  res.send('Seal the Sign backend is running');
});

mongoose
  .connect(process.env.MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true
  })
  .then(() => {
    console.log('✅ Connected to MongoDB!...');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

import documentRoutes from './routes/documentRoutes.js';
app.use('/api/docs', documentRoutes);
app.use('/api/signatures', signatureRoutes);


// Custom error handler
app.use((err, req, res, next) => {
  if (err instanceof Error && err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  // Default error fallback
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});


console.log('✅ Static uploads being served from:', path.join(__dirname, 'uploads'));
