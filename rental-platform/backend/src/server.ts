import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// CORS setup
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5174').split(',');
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive during dev
    }
  },
  credentials: true
}));

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'Zila Panchayat Almora — Online Rental Platform API',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root route
app.get('/', (req: Request, res: Response) => {
  res.send('🏛️ Zila Panchayat Almora — Online Rental Platform Backend API is running.');
});

app.listen(PORT, () => {
  console.log(`[Rental-API] Server running on port ${PORT}`);
  console.log(`[Rental-API] Health check: http://localhost:${PORT}/api/health`);
});
