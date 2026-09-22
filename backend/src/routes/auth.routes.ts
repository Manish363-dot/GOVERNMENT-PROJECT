import { Router } from 'express';
import { z } from 'zod';
import * as authController from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  passkey: z.string().min(1, 'Admin passkey is required'),
});

const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().min(4, 'Verification code is required'),
});

const resendOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const updateProfileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Public: Admin login and signup
router.post('/login', validate(loginSchema), authController.login);
router.post('/signup', validate(signupSchema), authController.signup);
router.post('/verify-otp', validate(verifyOtpSchema), authController.verifyOtp);
router.post('/resend-otp', validate(resendOtpSchema), authController.resendOtp);

// Public: Password Reset
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/verify-reset-otp', validate(verifyOtpSchema), authController.verifyResetOtp);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Authenticated: Profile operations
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

// Public: Finish Google OAuth signup / login
router.post('/google-login', authController.googleLogin);

export default router;
