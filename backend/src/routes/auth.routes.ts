import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passkey: z.string().min(1, 'Admin passkey is required'),
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
});

// Public: Admin signup with passkey
router.post('/signup', validate(signupSchema), authController.signup);

// Authenticated: Profile operations
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

export default router;
