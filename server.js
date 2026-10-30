import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// This project expects .env.local specifically, not .env. It has to load before
// the route modules are imported, because they read process.env when they are
// evaluated. Static imports are hoisted, so the routers are imported below.
dotenv.config({ path: '.env.local' });

const { default: mpesaRoutes } = await import('./api/mpesa/index.js');
const { default: authRoutes } = await import('./api/auth/index.js');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  next();
});

app.use('/api/mpesa', mpesaRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: process.env.MPESA_ENV || 'not configured',
    time: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `No route for ${req.originalUrl}` });
});

app.use((err, req, res, next) => {
  // An upstream rejection is useful to the caller and safe to report; anything
  // else stays generic.
  const upstream = err.response && err.response.status;
  if (upstream) {
    return res.status(502).json({
      success: false,
      message: `M-Pesa rejected the request (HTTP ${upstream})`,
    });
  }
  console.error('Request failed:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
  console.log(`health: http://localhost:${PORT}/api/health`);
  const missing = ['MONGODB_URI', 'MPESA_CONSUMER_KEY', 'MPESA_CONSUMER_SECRET']
    .filter((key) => !process.env[key]);
  if (missing.length) console.log(`Not configured yet: ${missing.join(', ')}`);
});

export default app;
