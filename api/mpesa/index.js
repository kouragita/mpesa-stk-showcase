import express from 'express';
const router = express.Router();

// Route handlers (ESM)
import { stkPushHandler } from './stkpush-express.js';
import { callbackHandler } from './callback-express.js';

// M-Pesa STK Push endpoint
router.post('/stkpush', stkPushHandler);

// M-Pesa callback endpoint
router.post('/callback', callbackHandler);

// Health check for M-Pesa routes
router.get('/health', (req, res) => {
  res.json({
    status: 'M-Pesa API routes active',
    environment: process.env.MPESA_ENV || 'not configured',
    baseURL: process.env.MPESA_ENV === 'sandbox' 
      ? 'https://sandbox.safaricom.co.ke' 
      : 'https://api.safaricom.co.ke',
    endpoints: {
      'POST /stkpush': 'Initiate STK Push payment',
      'POST /callback': 'Handle M-Pesa callback',
      'GET /health': 'Health check'
    },
    credentials: {
      consumerKey: process.env.MPESA_CONSUMER_KEY ? 'SET' : 'NOT SET',
      consumerSecret: process.env.MPESA_CONSUMER_SECRET ? 'SET' : 'NOT SET',
      shortcode: process.env.MPESA_SHORTCODE || 'NOT SET',
      callbackURL: process.env.MPESA_CALLBACK_URL || 'NOT SET'
    }
  });
});

export default router;
