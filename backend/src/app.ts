import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env, isOriginAllowed } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { csrfProtection } from './middleware/csrf';
import cookieParser from 'cookie-parser';

// Routes
import authRoutes from './routes/auth.routes';
import vehicleRoutes from './routes/vehicle.routes';
import gpsDeviceRoutes from './routes/gpsDevice.routes';
import trackingRoutes from './routes/tracking.routes';
import historyRoutes from './routes/history.routes';
import complaintRoutes from './routes/complaint.routes';
import mediaRoutes from './routes/media.routes';

const app = express();

const isProduction = env.NODE_ENV === 'production';

// Trust proxy only in production (behind a reverse proxy / load balancer)
if (isProduction) {
  app.set('trust proxy', 1);
}

// Security Headers
app.disable('x-powered-by'); // Explicitly remove Express technology header

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        // Since this is a JSON API, it should not load any external resources.
        // If the backend ever serves HTML, this restricts scripts/styles completely.
        defaultSrc: ["'none'"],
        baseUri: ["'none'"],
        formAction: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    // HSTS is only enabled in production (HTTPS)
    hsts: isProduction ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    // Allow cross-origin read so the separate React frontend can consume the API/resources
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    // Prevent MIME-sniffing
    xContentTypeOptions: true,
    // Frame protection (DENY since it's an API)
    xFrameOptions: { action: 'deny' },
  })
);

// CORS — strictly validate origins (configured production domains + local dev origins)
// CORS — strictly validate origins (configured production domains + local dev origins)
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin not allowed: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Upload rate limit: 20 per hour per IP (expensive operation)
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { error: 'Too many files uploaded. Please try again later.' },
});

// Health check (exempt from CSRF and Rate Limiting)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/verify-reset-otp', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/auth/resend-otp', authLimiter);
app.use('/api/complaints', (req, res, next) => {
  if (req.method === 'POST') {
    return complaintLimiter(req, res, next);
  }
  next();
});
app.use('/api/media', (req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return uploadLimiter(req, res, next);
  }
  next();
});

// Apply CSRF Protection to all API routes
app.use('/api', csrfProtection);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/gps-devices', gpsDeviceRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/media', mediaRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

export default app;
