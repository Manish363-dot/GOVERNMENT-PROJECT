import { Router } from 'express';
import { z } from 'zod';
import * as gpsDeviceController from '../controllers/gpsDevice.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All GPS device routes require authentication
router.use(authMiddleware);

// Validation schemas
const createDeviceSchema = z.object({
  device_name: z.string().optional(),
  device_identifier: z.string().min(1, 'Device identifier is required'),
  imei: z.string().optional(),
});

const assignSchema = z.object({
  vehicle_id: z.string().uuid('Invalid vehicle ID'),
  gps_device_id: z.string().uuid('Invalid GPS device ID'),
});

const unassignSchema = z.object({
  assignment_id: z.string().uuid('Invalid assignment ID'),
});

router.get('/', gpsDeviceController.getAll);
router.get('/assignments', gpsDeviceController.getAssignments);
router.get('/:id', gpsDeviceController.getById);
router.post('/', validate(createDeviceSchema), gpsDeviceController.create);
router.put('/:id', gpsDeviceController.update);
router.delete('/:id', gpsDeviceController.remove);
router.post('/assign', validate(assignSchema), gpsDeviceController.assign);
router.post('/unassign', validate(unassignSchema), gpsDeviceController.unassign);

export default router;
