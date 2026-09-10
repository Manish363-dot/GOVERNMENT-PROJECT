import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types';
import * as authService from '../services/auth.service';

/**
 * POST /api/auth/signup
 * Public — registers a new admin with passkey verification.
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { full_name, email, password, passkey } = req.body;

    const result = await authService.signupAdmin(full_name, email, password, passkey);

    res.status(201).json({
      message: 'Admin account created successfully',
      profile: result.profile,
    });
    } catch (err: any) {
      console.error('Signup Error:', err);
      if (err.message === 'INVALID_PASSKEY') {
        res.status(403).json({ error: 'Invalid admin passkey' });
        return;
      }
      if (err.message?.includes('already been registered')) {
        res.status(409).json({ error: 'Email is already registered' });
        return;
      }
      res.status(500).json({ error: 'Failed to create admin account: ' + (err.message || 'Unknown error') });
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
