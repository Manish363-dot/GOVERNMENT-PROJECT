import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import gpsDeviceRoutes from './routes/gpsDevice.routes';
import trackingRoutes from './routes/tracking.routes';
import historyRoutes from './routes/history.routes';
import complaintRoutes from './routes/complaint.routes';

const app = express();

// Trust Vercel proxy for rate limiting
app.set('trust proxy', 1);

// Security
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 requests per window
  message: { error: 'Too many requests, please try again later.' },
});

const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // max 10 complaints per hour per IP
  message: { error: 'Too many complaints submitted. Please try again later.' },
});

app.use('/api/', limiter);
app.use('/api/complaints', complaintLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/gps-devices', gpsDeviceRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/complaints', complaintRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
