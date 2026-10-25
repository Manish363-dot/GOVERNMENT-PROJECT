import { Response } from 'express';
import { rentalAuthService } from '../services/rentalAuth.service';
import { AuthenticatedRentalRequest } from '../middleware/rentalAuth.middleware';
import { sendSuccess, sendError } from '../../../shared/utils/response.util';
import { rentalPrisma } from '../../../shared/config/rentalPrisma';
import { z } from 'zod';

const adminLoginSchema = z.object({
  identifier: z.string().min(3, 'Username, Mobile or Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const subAdminCreateSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  fullName: z.string().min(2, 'Full name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Valid 10-digit mobile number required'),
  email: z.string().email().optional(),
  initialPassword: z.string().min(8, 'Password must be at least 8 characters'),
  permissions: z.array(z.string()).optional(),
});

const userLoginSchema = z.object({
  identifier: z.string().min(3, 'User ID or Mobile number is required'),
  password: z.string().min(6, 'Password is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export class RentalAuthController {
  /**
   * POST /api/rental/auth/admin/login
   * Administrator Login (Super Admin & Sub Admin) with rate limiting
   */
  async adminLogin(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const parsed = adminLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid input data', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalAuthService.adminLogin(parsed.data.identifier, parsed.data.password, clientIp);

      // Set HTTP-only secure cookie for admin session
      res.cookie('rental_admin_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 8 * 60 * 60 * 1000, // 8 hours
      });

      return sendSuccess(res, result, 'Administrator logged in successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Authentication failed', 401);
    }
  }

  /**
   * GET /api/rental/auth/admin/me
   * Get current authenticated administrator profile session
   */
  async getAdminProfile(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin) {
        return sendError(res, 'Administrator authentication required', 401);
      }

      const admin = await rentalPrisma.rentalAdmin.findUnique({
        where: { id: req.rentalAdmin.adminId },
        select: {
          id: true,
          username: true,
          full_name: true,
          role: true,
          mobile: true,
          email: true,
          permissions: true,
        },
      });

      if (!admin) {
        return sendError(res, 'Administrator record not found', 404);
      }

      return sendSuccess(
        res,
        {
          admin: {
            id: admin.id,
            username: admin.username,
            fullName: admin.full_name,
            role: admin.role,
            mobile: admin.mobile,
            email: admin.email,
            permissions: admin.permissions,
          },
        },
        'Administrator profile retrieved'
      );
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch admin profile', 500);
    }
  }

  /**
   * POST /api/rental/auth/admin/subadmins
   * Create Sub Admin (Super Admin only)
   */
  async createSubAdmin(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin || req.rentalAdmin.role !== 'SUPER_ADMIN') {
        return sendError(res, 'Only Super Admin can create sub administrator accounts', 403);
      }

      const parsed = subAdminCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid sub-admin data', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalAuthService.createSubAdmin(req.rentalAdmin.adminId, parsed.data, clientIp);

      return sendSuccess(res, result, 'Sub Admin created successfully', 201);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to create Sub Admin', 400);
    }
  }

  /**
   * GET /api/rental/auth/admin/subadmins
   * List all Sub Admins (Super Admin only)
   */
  async listSubAdmins(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin || req.rentalAdmin.role !== 'SUPER_ADMIN') {
        return sendError(res, 'Access restricted to Super Admin', 403);
      }

      const list = await rentalAuthService.listSubAdmins();
      return sendSuccess(res, list, 'Sub Admins retrieved successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to retrieve Sub Admins', 500);
    }
  }

  /**
   * PATCH /api/rental/auth/admin/subadmins/:id/status
   * Toggle Sub Admin Status (Super Admin only)
   */
  async toggleSubAdminStatus(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalAdmin || req.rentalAdmin.role !== 'SUPER_ADMIN') {
        return sendError(res, 'Access restricted to Super Admin', 403);
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!id || !['ACTIVE', 'INACTIVE'].includes(status)) {
        return sendError(res, 'Valid ID and status (ACTIVE / INACTIVE) are required', 400);
      }

      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.ip || 'Unknown';
      const result = await rentalAuthService.toggleSubAdminStatus(req.rentalAdmin.adminId, id, status, clientIp);

      return sendSuccess(res, result, `Sub Admin account ${status.toLowerCase()}d successfully`);
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to update Sub Admin status', 400);
    }
  }

  /**
   * POST /api/rental/auth/user/login
   * Tenant / Registered User Login with rate limiting
   */
  async userLogin(req: AuthenticatedRentalRequest, res: Response) {
    try {
      const parsed = userLoginSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid login details', 400);
      }

      const result = await rentalAuthService.userLogin(parsed.data.identifier, parsed.data.password);

      // Set HTTP-only secure cookie for tenant session
      res.cookie('rental_user_token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000, // 12 hours
      });

      return sendSuccess(res, result, 'Tenant signed in successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Authentication failed', 401);
    }
  }

  /**
   * GET /api/rental/auth/user/me
   * Get Current Tenant Profile
   */
  async getUserProfile(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalUser) {
        return sendError(res, 'Unauthorized tenant access', 401);
      }

      const profile = await rentalAuthService.getUserProfile(req.rentalUser.userId);
      return sendSuccess(res, profile, 'Tenant profile fetched successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to fetch tenant profile', 500);
    }
  }

  /**
   * POST /api/rental/auth/user/change-password
   * Change Tenant Password
   */
  async changeUserPassword(req: AuthenticatedRentalRequest, res: Response) {
    try {
      if (!req.rentalUser) {
        return sendError(res, 'Unauthorized tenant access', 401);
      }

      const parsed = changePasswordSchema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, parsed.error.issues[0]?.message || 'Invalid password data', 400);
      }

      const result = await rentalAuthService.changeUserPassword(
        req.rentalUser.userId,
        parsed.data.currentPassword,
        parsed.data.newPassword
      );

      return sendSuccess(res, result, 'Password changed successfully');
    } catch (err: any) {
      return sendError(res, err.message || 'Failed to change password', 400);
    }
  }
}

export const rentalAuthController = new RentalAuthController();
