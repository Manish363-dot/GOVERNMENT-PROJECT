import app from './app';
import { env } from './config/env';
import { createServer } from 'http';
import { Server } from 'socket.io';

const PORT = parseInt(env.PORT, 10);

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

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
  ┌─────────────────────────────────────────────┐
  │                                             │
  │   🚛 Zila Panchayat Safai Backend          │
  │   Smart Waste Collection Tracking           │
  │                                             │
  │   Server running on port ${PORT}              │
  │   Health: http://localhost:${PORT}/api/health  │
  │   Socket.io: Enabled                        │
  │                                             │
  └─────────────────────────────────────────────┘
  `);
});
