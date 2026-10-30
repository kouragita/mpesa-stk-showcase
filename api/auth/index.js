import express from 'express';

const router = express.Router();

// Login and registration were never finished: this build is about the payment
// flow, so the auth routes return a clear "not built yet" instead of pretending.
router.post('/login', (req, res) => {
  res.status(501).json({ success: false, message: 'Login is not implemented in this build' });
});

router.post('/register', (req, res) => {
  res.status(501).json({ success: false, message: 'Registration is not implemented in this build' });
});

export default router;
