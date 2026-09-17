import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/auth.service';

/**
 * POST /api/auth/signup
 * Public — validates passkey and initiates email OTP verification.
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { full_name, email, password, passkey } = req.body;

    if (!full_name || !email || !password || !passkey) {
      res.status(400).json({ error: 'All fields including Admin Passkey are mandatory' });
      return;
    }

    const result = await authService.signupAdmin(full_name, email, password, passkey);

    res.status(200).json({
      message: result.message,
      email: result.email,
      requiresOtp: result.requiresOtp,
    });
  } catch (err: any) {
    console.error('Signup Error:', err);
    if (err.message === 'INVALID_PASSKEY') {
      res.status(403).json({ error: 'Invalid admin passkey. Contact your department head.' });
      return;
    }
    if (err.message === 'INVALID_EMAIL_FORMAT') {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }
    if (err.message === 'EMAIL_ALREADY_REGISTERED' || err.message?.includes('already been registered')) {
      res.status(409).json({ error: 'This email is already registered. Please login.' });
      return;
    }
    res.status(500).json({ error: 'Failed to initiate registration: ' + (err.message || 'Unknown error') });
  }
}

/**
 * POST /api/auth/verify-otp
 * Public — verifies 6-digit OTP code and activates official account.
 */
export async function verifyOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      res.status(400).json({ error: 'Email and 6-digit OTP code are required' });
      return;
    }

    const result = await authService.verifyOtp(email, otp);

    res.status(200).json({
      message: result.message,
      verified: result.verified,
      profile: result.profile,
    });
  } catch (err: any) {
    console.error('OTP Verification Error:', err);
    if (err.message === 'INVALID_OTP') {
      res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
      return;
    }
    if (err.message === 'OTP_EXPIRED') {
      res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      return;
    }
    if (err.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'No registration request found for this email.' });
      return;
    }
    res.status(500).json({ error: 'Failed to verify code: ' + (err.message || 'Unknown error') });
  }
}

/**
 * POST /api/auth/resend-otp
 * Public — resends a new 6-digit OTP to the registered email.
 */
export async function resendOtp(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: 'Email is required to resend code' });
      return;
    }

    const result = await authService.resendOtp(email);

    res.status(200).json({
      message: result.message,
      sent: result.sent,
    });
  } catch (err: any) {
    console.error('Resend OTP Error:', err);
    if (err.message === 'USER_NOT_FOUND') {
      res.status(404).json({ error: 'No registration found for this email.' });
      return;
    }
    if (err.message === 'EMAIL_ALREADY_CONFIRMED') {
      res.status(400).json({ error: 'Email is already verified. Please sign in directly.' });
      return;
    }
    res.status(500).json({ error: 'Failed to resend verification code: ' + (err.message || 'Unknown error') });
  }
}

/**
 * GET /api/auth/profile
 * Authenticated — returns the current admin's profile.
 */
export async function getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const profile = await authService.getProfile(req.userId!);

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
}

/**
 * PUT /api/auth/profile
 * Authenticated — updates the current admin's profile.
 */
export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { full_name } = req.body;
    const profile = await authService.updateProfile(req.userId!, { full_name });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

/**
 * POST /api/auth/google-callback
 * Authenticated — finishes profile creation for new Google OAuth signups via passkey.
 */
export async function googleSignupComplete(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { passkey } = req.body;
    const user = req.user!; 
    const email = user.email;
    const full_name = user.user_metadata?.full_name || user.user_metadata?.name;
    
    // Fallbacks just in case
    const userEmail = email || 'unknown@example.com';
    const userFullName = full_name || userEmail.split('@')[0];

    const profile = await authService.createGoogleAdminProfile(req.userId!, userEmail, userFullName, passkey);

    res.status(200).json({
      message: 'Google admin profile setup successfully',
      profile,
    });
  } catch (err: any) {
    console.error('Google Signup Callback Error:', err);
    if (err.message === 'INVALID_PASSKEY') {
      res.status(403).json({ error: 'Invalid admin passkey' });
      return;
    }
    res.status(500).json({ error: 'Failed to complete Google setup: ' + (err.message || 'Unknown error') });
  }
}
