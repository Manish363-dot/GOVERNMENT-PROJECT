import { Router } from 'express';
import * as gpsDeviceController from '../controllers/gpsDevice.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createDeviceSchema,
  updateDeviceSchema,
  assignSchema,
  unassignSchema,
  gpsDeviceIdParamSchema,
} from '../schemas/gpsDevice.schema';

const router = Router();

// All GPS device routes require authentication
router.use(authMiddleware, requireAdmin);

router.get('/', gpsDeviceController.getAll);
router.get('/assignments', gpsDeviceController.getAssignments);
router.get('/:id', validate(gpsDeviceIdParamSchema), gpsDeviceController.getById);
router.post('/', validate(createDeviceSchema), gpsDeviceController.create);
router.put('/:id', validate(updateDeviceSchema), gpsDeviceController.update);
router.delete('/:id', validate(gpsDeviceIdParamSchema), gpsDeviceController.remove);
router.post('/assign', validate(assignSchema), gpsDeviceController.assign);
router.post('/unassign', validate(unassignSchema), gpsDeviceController.unassign);

export default router;
