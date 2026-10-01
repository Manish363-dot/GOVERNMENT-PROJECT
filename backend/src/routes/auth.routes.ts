import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  loginSchema,
  signupSchema,
  verifyOtpSchema,
  resendOtpSchema,
  updateProfileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleLoginSchema,
} from '../schemas/auth.schema';

const router = Router();

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
router.get('/profile', authMiddleware, requireAdmin, authController.getProfile);
router.put('/profile', authMiddleware, requireAdmin, validate(updateProfileSchema), authController.updateProfile);

// Public: Finish Google OAuth signup / login
router.post('/google-login', validate(googleLoginSchema), authController.googleLogin);

// Public: Logout
router.post('/logout', authController.logout);

export default router;
