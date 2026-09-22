import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env, getCorsOrigins } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import gpsDeviceRoutes from './routes/gpsDevice.routes';
import trackingRoutes from './routes/tracking.routes';
import historyRoutes from './routes/history.routes';
import complaintRoutes from './routes/complaint.routes';

const app = express();

const isProduction = env.NODE_ENV === 'production';

// Trust proxy only in production (behind a reverse proxy / load balancer)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security
app.use(helmet());

// CORS — support multiple origins from env
const allowedOrigins = getCorsOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate Limiters ───────────────────────────────────────────────

// Global rate limit: 1000 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { error: 'Too many requests, please try again later.' },
});

// Auth rate limit: 10 attempts per 15 minutes per IP (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Complaint rate limit: 100 per hour per IP
const complaintLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: { error: 'Too many complaints submitted. Please try again later.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/verify-reset-otp', authLimiter);
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
