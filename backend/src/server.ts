import app from './app';
import { env } from './config/env';

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────────┐
  │                                             │
  │   🚛 Zila Panchayat Safai Backend          │
  │   Smart Waste Collection Tracking           │
  │                                             │
  │   Server running on port ${PORT}              │
  │   Health: http://localhost:${PORT}/api/health  │
  │                                             │
  └─────────────────────────────────────────────┘
  `);
});
