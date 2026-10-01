import { Router } from 'express';
import * as vehicleController from '../controllers/vehicle.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createVehicleSchema, updateVehicleSchema, vehicleIdParamSchema } from '../schemas/vehicle.schema';

const router = Router();

// All vehicle routes require authentication
router.use(authMiddleware, requireAdmin);

router.get('/', vehicleController.getAll);
router.get('/:id', validate(vehicleIdParamSchema), vehicleController.getById);
router.post('/', validate(createVehicleSchema), vehicleController.create);
router.put('/:id', validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', validate(vehicleIdParamSchema), vehicleController.remove);

export default router;
