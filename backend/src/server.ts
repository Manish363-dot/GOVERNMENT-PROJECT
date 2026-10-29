// Server entry point - Zila Panchayat Almora
import app from './app';
import { env, isOriginAllowed } from './shared/config/env';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { millitrackSyncService, setSocketIoInstance } from './modules/swm/services/millitrack.service';

const PORT = parseInt(env.PORT, 10);

const httpServer = createServer(app);

// Socket.io with multi-origin CORS support
export const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS origin not allowed'), false);
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Store io instance on Express app for access in controllers
app.set('io', io);
setSocketIoInstance(io);

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  socket.on('subscribe_live_locations', () => {
    socket.join('live_locations');
    console.log(`[Socket.io] ${socket.id} subscribed to live_locations`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────────────────┐
  │                                                         │
  │   🏛️ Zila Panchayat Almora — Modular Monolith Server    │
  │   • SWM & Cleanliness Fleet GPS API  (/api/swm)         │
  │   • Commercial Rental & Assets API   (/api/rental)      │
  │   • Government Payments & e-Challan  (/api/payments)    │
  │                                                         │
  │   Port:            ${PORT.toString().padEnd(37)}│
  │   System Health:   http://localhost:${PORT}/api/health       │
  │   SWM Health:      http://localhost:${PORT}/api/swm/health   │
  │   Rental Health:   http://localhost:${PORT}/api/rental/health│
  │   Socket.io:       Enabled (Live Telematics)            │
  │   Environment:     ${env.NODE_ENV.padEnd(37)}│
  │                                                         │
  └─────────────────────────────────────────────────────────┘
  `);

  // Start automated MilliTrack live GPS sync (every 4 seconds for fast live tracking)
  // Cluster safety: In multi-worker / PM2 cluster mode, only instance '0' runs the sync loop
  const isMasterInstance = !process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0';
  if (isMasterInstance) {
    millitrackSyncService.startSync(4000);
    console.log('📡 [MilliTrack] Automated GPS sync loop started on master instance.');
  } else {
    console.log('ℹ️ [MilliTrack] Secondary cluster worker: GPS sync loop skipped to prevent duplicate API polling.');
  }
});

// Graceful shutdown handling
async function gracefulShutdown() {
  console.log('\n[Server] Shutting down gracefully...');
  millitrackSyncService.stopSync();
  
  // Close HTTP server
  httpServer.close(() => {
    console.log('[Server] HTTP server closed.');
  });
  
  // Disconnect Prisma
  try {
    const { prisma } = require('./shared/config/prisma');
    await prisma.$disconnect();
    console.log('[Prisma] Disconnected from database.');
  } catch (err) {
    console.error('[Prisma] Error during disconnection:', err);
  }
  
  process.exit(0);
}

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // For nodemon / tsx watch
