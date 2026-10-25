import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../../shared/config/env';
import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';

export interface RentalAdminPayload {
  adminId: string;
  username: string;
  role: 'SUPER_ADMIN' | 'SUB_ADMIN';
  mobile: string;
  permissions: string[];
}

export interface RentalUserPayload {
  userId: string;       // Primary UUID in DB
  userCode: string;     // Unique formatted ID, e.g. "ALM-RENT-2026-0001"
  mobile: string;
  fullName: string;
  role: 'RENTAL_USER';
}

export interface AuthenticatedRentalRequest extends Request {
  rentalAdmin?: RentalAdminPayload;
  rentalUser?: RentalUserPayload;
}

/**
 * Middleware: Authenticate Rental Admin (Super Admin or Sub Admin)
 * Verifies JWT token from Authorization header or cookie, then confirms active status in Database A.
 */
export async function rentalAdminAuth(
  req: AuthenticatedRentalRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.rental_admin_token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      res.status(401).json({ success: false, error: 'Rental admin authentication token required.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      res.status(401).json({ success: false, error: 'Invalid or expired administrator session.' });
      return;
    }

    if (!decoded.adminId || !decoded.role || !['SUPER_ADMIN', 'SUB_ADMIN'].includes(decoded.role)) {
      res.status(403).json({ success: false, error: 'Invalid token structure for rental administrator.' });
      return;
    }

    // Verify active status directly in Rental Management Database (Database A)
    const adminRecord = await withRentalDbRetry(() =>
      rentalPrisma.rentalAdmin.findUnique({
        where: { id: decoded.adminId },
        select: { id: true, username: true, role: true, status: true, mobile: true, permissions: true },
      })
    );

    if (!adminRecord || adminRecord.status !== 'ACTIVE') {
      res.status(403).json({ success: false, error: 'Administrator account is deactivated or suspended.' });
      return;
    }

    req.rentalAdmin = {
      adminId: adminRecord.id,
      username: adminRecord.username,
      role: adminRecord.role,
      mobile: adminRecord.mobile,
      permissions: adminRecord.permissions,
    };

    next();
  } catch (err: any) {
    console.error('[Rental Admin Auth Error]:', err);
    res.status(500).json({ success: false, error: 'Authentication verification failure.' });
  }
}

/**
 * Middleware: Require Super Admin Role
 * Strictly restricts operation to Rental Super Admin.
 */
export function requireRentalSuperAdmin(
  req: AuthenticatedRentalRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.rentalAdmin || req.rentalAdmin.role !== 'SUPER_ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Restricted access: Operation requires Rental Super Admin privileges.',
    });
    return;
  }
  next();
}

/**
 * Middleware: Authenticate Registered Rental Tenant / User
 * Verifies JWT token and checks active account status in Database A.
 */
export async function rentalUserAuth(
  req: AuthenticatedRentalRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = req.cookies?.rental_user_token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

    if (!token) {
      res.status(401).json({ success: false, error: 'Tenant authentication token required.' });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (jwtErr) {
      res.status(401).json({ success: false, error: 'Invalid or expired session. Please sign in again.' });
      return;
    }

    if (!decoded.userId || decoded.role !== 'RENTAL_USER') {
      res.status(403).json({ success: false, error: 'Access token is not authorized for tenant services.' });
      return;
    }

    // Verify active status in Database A
    const userRecord = await withRentalDbRetry(() =>
      rentalPrisma.rentalUser.findUnique({
        where: { id: decoded.userId },
        select: { id: true, user_id: true, full_name: true, mobile: true, status: true },
      })
    );

    if (!userRecord || userRecord.status !== 'ACTIVE') {
      res.status(403).json({
        success: false,
        error: 'Tenant account is inactive or pending verification. Please contact the designated officer.',
      });
      return;
    }

    req.rentalUser = {
      userId: userRecord.id,
      userCode: userRecord.user_id,
      mobile: userRecord.mobile,
      fullName: userRecord.full_name,
      role: 'RENTAL_USER',
    };

    next();
  } catch (err: any) {
    console.error('[Rental User Auth Error]:', err);
    res.status(500).json({ success: false, error: 'Tenant authentication verification failure.' });
  }
}

/**
 * Object-Level Authorization Guard:
 * Strictly prevents IDOR (Insecure Direct Object Reference) vulnerabilities.
 * Ensures an authenticated tenant can ONLY access their own records.
 */
export function enforceTenantOwnership(targetUserIdParam = 'userId') {
  return (req: AuthenticatedRentalRequest, res: Response, next: NextFunction): void => {
    // If request is made by an authorized administrator, allow access
    if (req.rentalAdmin) {
      return next();
    }

    const requestedUserId = req.params[targetUserIdParam] || req.body?.userId || req.query?.userId;

    if (!req.rentalUser || (requestedUserId && requestedUserId !== req.rentalUser.userId && requestedUserId !== req.rentalUser.userCode)) {
      res.status(403).json({
        success: false,
        error: 'Forbidden: You are not authorized to view or modify records belonging to another tenant.',
      });
      return;
    }

    next();
  };
}
