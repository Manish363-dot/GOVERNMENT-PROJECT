import { Router } from 'express';
import { z } from 'zod';
import * as vehicleController from '../controllers/vehicle.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All vehicle routes require authentication
router.use(authMiddleware);

// Validation schemas
const createVehicleSchema = z.object({
  vehicle_number: z.string().min(1, 'Vehicle number is required'),
  vehicle_name: z.string().optional(),
  vehicle_type: z.enum(['truck', 'mini_truck', 'auto', 'other']).optional(),
});

const updateVehicleSchema = z.object({
  vehicle_number: z.string().optional(),
  vehicle_name: z.string().optional(),
  vehicle_type: z.enum(['truck', 'mini_truck', 'auto', 'other']).optional(),
  status: z.enum(['moving', 'idle', 'offline']).optional(),
});

router.get('/', vehicleController.getAll);
router.get('/:id', vehicleController.getById);
router.post('/', validate(createVehicleSchema), vehicleController.create);
router.put('/:id', validate(updateVehicleSchema), vehicleController.update);
router.delete('/:id', vehicleController.remove);

export default router;
