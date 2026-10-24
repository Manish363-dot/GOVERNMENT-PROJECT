import { Router } from 'express';
import vehicleRoutes from '../../routes/vehicle.routes';
import gpsDeviceRoutes from '../../routes/gpsDevice.routes';
import trackingRoutes from '../../routes/tracking.routes';
import historyRoutes from '../../routes/history.routes';
import complaintRoutes from '../../routes/complaint.routes';
import mediaRoutes from '../../routes/media.routes';
import pledgeRoutes from '../../routes/pledge.routes';

const router = Router();

// SWM Module Health & Status
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    module: 'Solid Waste Management (SWM) & Safai Fleet GPS Telematics',
    services: {
      gpsTracking: 'active',
      fleetManagement: 'active',
      complaintsDesk: 'active',
      mediaLogs: 'active',
      pledgeService: 'active'
    },
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Modular sub-routes under /api/swm/
router.use('/vehicles', vehicleRoutes);
router.use('/gps-devices', gpsDeviceRoutes);
router.use('/tracking', trackingRoutes);
router.use('/history', historyRoutes);
router.use('/complaints', complaintRoutes);
router.use('/media', mediaRoutes);
router.use('/pledge', pledgeRoutes);

export default router;
