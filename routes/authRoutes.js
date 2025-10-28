import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ message: 'Axios working! Backend reached.' });
});

router.post('/register', registerUser);
router.post('/login', loginUser);

export default router;