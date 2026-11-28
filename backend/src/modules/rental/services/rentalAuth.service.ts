import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../shared/config/env';
import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { invalidateRentalAdminCache } from '../middleware/rentalAuth.middleware';
import { rentalCache } from '../utils/rentalCache.util';

export class RentalAuthService {
  /**
   * Initialize / Provision the root Super Admin in Database A if none exists.
   * Safe, idempotent bootstrap.
   */
  async ensureSuperAdminProvisioned() {
    return withRentalDbRetry(async () => {
      const existingSuperAdmin = await rentalPrisma.rentalAdmin.findFirst({
        where: { role: 'SUPER_ADMIN' },
      });

      if (!existingSuperAdmin) {
        const defaultPassword = process.env.RENTAL_SUPERADMIN_INITIAL_PASSWORD || 'AlmoraZila@2026#Admin';
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(defaultPassword, salt);

        const superAdmin = await rentalPrisma.rentalAdmin.create({
          data: {
            full_name: 'मुख्य प्रशासनिक अधिकारी',
            mobile: '9412000001',
            email: 'admin.rental@almora.uk.gov.in',
            passwordHash,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            permissions: ['*'],
          },
        });

        console.log('🏛️ [Rental DB] Root Super Admin provisioned:', superAdmin.mobile);
        return superAdmin;
      }
      return existingSuperAdmin;
    });
  }

  /**
   * Administrator Login (Super Admin & Sub Admin)
   */
  async adminLogin(identifier: string, plainPass: string, ipAddress?: string) {
    return withRentalDbRetry(async () => {
      await this.ensureSuperAdminProvisioned();

      const trimmed = identifier.trim();
      const admin = await rentalPrisma.rentalAdmin.findFirst({
        where: {
          OR: [{ mobile: trimmed }, { email: trimmed.toLowerCase() }],
        },
      });

      if (!admin) {
        throw new Error('Invalid administrator credentials.');
      }

      if (admin.status !== 'ACTIVE') {
        throw new Error('Your administrator account is deactivated. Contact the Super Admin.');
      }

      const isMatch = await bcrypt.compare(plainPass, admin.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid administrator credentials.');
      }

      // Guarantee SUPER_ADMIN role for 9412000001
      if (admin.mobile === '9412000001' && admin.role !== 'SUPER_ADMIN') {
        admin.role = 'SUPER_ADMIN';
        await rentalPrisma.rentalAdmin.update({
          where: { id: admin.id },
          data: { role: 'SUPER_ADMIN' },
        });
      }

      await rentalPrisma.rentalAdmin.update({
        where: { id: admin.id },
        data: { last_login_at: new Date() },
      });

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: admin.id,
          action: 'ADMIN_LOGIN',
          target_entity: 'RentalAdmin',
          target_id: admin.id,
          ip_address: ipAddress || 'Unknown',
        },
      });

      const token = jwt.sign(
        {
          adminId: admin.id,
          role: admin.role,
          mobile: admin.mobile,
          permissions: admin.permissions,
        },
        env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      return {
        token,
        admin: {
          id: admin.id,
          fullName: admin.full_name,
          role: admin.role,
          mobile: admin.mobile,
          email: admin.email,
          permissions: admin.permissions,
        },
      };
    });
  }

  /**
   * Create a new Sub Admin (Super Admin only)
   */
  async createSubAdmin(
    creatorAdminId: string,
    data: {
      fullName: string;
      mobile: string;
      email?: string;
      initialPassword: string;
      permissions?: string[];
    },
    ipAddress?: string
  ) {
    return withRentalDbRetry(async () => {
      const cleanMobile = data.mobile.trim();
      const cleanEmail = data.email?.trim().toLowerCase() || null;

      const existing = await rentalPrisma.rentalAdmin.findFirst({
        where: {
          OR: [
            { mobile: cleanMobile },
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
      });

      if (existing) {
        throw new Error('An administrator with this mobile number or email already exists.');
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(data.initialPassword, salt);

      const subAdmin = await rentalPrisma.rentalAdmin.create({
        data: {
          full_name: data.fullName.trim(),
          mobile: cleanMobile,
          email: cleanEmail,
          passwordHash,
          role: 'SUB_ADMIN',
          status: 'ACTIVE',
          permissions: data.permissions || ['manage_tenants', 'view_bills', 'record_payments'],
        },
      });

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: creatorAdminId,
          action: 'SUB_ADMIN_CREATED',
          target_entity: 'RentalAdmin',
          target_id: subAdmin.id,
          after_state: JSON.stringify({
            fullName: subAdmin.full_name,
            mobile: subAdmin.mobile,
            role: subAdmin.role,
          }),
          ip_address: ipAddress || 'Unknown',
        },
      });

      rentalCache.invalidate('subadmins:');

      return {
        id: subAdmin.id,
        fullName: subAdmin.full_name,
        role: subAdmin.role,
        mobile: subAdmin.mobile,
        email: subAdmin.email,
        status: subAdmin.status,
        permissions: subAdmin.permissions,
      };
    });
  }

  /**
   * Update Sub Admin Profile (Super Admin only)
   */
  async updateSubAdmin(
    superAdminId: string,
    subAdminId: string,
    data: {
      fullName?: string;
      mobile?: string;
      email?: string | null;
      password?: string;
      permissions?: string[];
    },
    ipAddress?: string
  ) {
    return withRentalDbRetry(async () => {
      const existingAdmin = await rentalPrisma.rentalAdmin.findUnique({
        where: { id: subAdminId },
      });

      if (!existingAdmin) {
        throw new Error('Sub Admin not found.');
      }

      if (existingAdmin.role === 'SUPER_ADMIN') {
        throw new Error('Cannot modify Super Admin profile through this route.');
      }

      const nextMobile = data.mobile !== undefined ? data.mobile.trim() : existingAdmin.mobile;
      const nextEmail =
        data.email !== undefined ? (data.email ? data.email.trim().toLowerCase() : null) : existingAdmin.email;

      if (nextMobile !== existingAdmin.mobile || (nextEmail && nextEmail !== existingAdmin.email)) {
        const duplicate = await rentalPrisma.rentalAdmin.findFirst({
          where: {
            id: { not: subAdminId },
            OR: [
              { mobile: nextMobile },
              ...(nextEmail ? [{ email: nextEmail }] : []),
            ],
          },
        });

        if (duplicate) {
          throw new Error('Another administrator already uses this mobile number or email.');
        }
      }

      const updatePayload: any = {};
      if (data.fullName !== undefined) {
        updatePayload.full_name = data.fullName.trim();
      }
      if (data.mobile !== undefined) {
        updatePayload.mobile = nextMobile;
      }
      if (data.email !== undefined) {
        updatePayload.email = nextEmail;
      }
      if (data.permissions !== undefined) {
        updatePayload.permissions = data.permissions;
      }
      if (data.password && data.password.trim().length >= 8) {
        const salt = await bcrypt.genSalt(12);
        updatePayload.passwordHash = await bcrypt.hash(data.password, salt);
      }

      const updated = await rentalPrisma.rentalAdmin.update({
        where: { id: subAdminId },
        data: updatePayload,
        select: {
          id: true,
          full_name: true,
          mobile: true,
          email: true,
          role: true,
          status: true,
          permissions: true,
          last_login_at: true,
          created_at: true,
        },
      });

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: superAdminId,
          action: 'SUB_ADMIN_UPDATED',
          target_entity: 'RentalAdmin',
          target_id: subAdminId,
          after_state: JSON.stringify({
            fullName: updated.full_name,
            mobile: updated.mobile,
            email: updated.email,
            permissions: updated.permissions,
            passwordChanged: Boolean(data.password && data.password.trim().length >= 8),
          }),
          ip_address: ipAddress || 'Unknown',
        },
      });

      invalidateRentalAdminCache(subAdminId);
      rentalCache.invalidate('subadmins:');

      return {
        id: updated.id,
        fullName: updated.full_name,
        full_name: updated.full_name,
        mobile: updated.mobile,
        email: updated.email,
        role: updated.role,
        status: updated.status,
        permissions: updated.permissions,
        lastLoginAt: updated.last_login_at,
        createdAt: updated.created_at,
        created_at: updated.created_at,
      };
    });
  }

  /**
   * List all Sub Admins (Super Admin only)
   */
  async listSubAdmins() {
    return rentalCache.getOrSet('subadmins:all', 20_000, () =>
      withRentalDbRetry(async () => {
        const admins = await rentalPrisma.rentalAdmin.findMany({
          where: { role: 'SUB_ADMIN' },
          select: {
            id: true,
            full_name: true,
            mobile: true,
            email: true,
            role: true,
            status: true,
            permissions: true,
            last_login_at: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        });

        return admins.map((a) => ({
          id: a.id,
          fullName: a.full_name,
          full_name: a.full_name,
          mobile: a.mobile,
          email: a.email,
          role: a.role,
          status: a.status,
          permissions: a.permissions,
          lastLoginAt: a.last_login_at,
          createdAt: a.created_at,
          created_at: a.created_at,
        }));
      })
    );
  }

  /**
   * Toggle Sub Admin Status (Active / Inactive) (Super Admin only)
   */
  async toggleSubAdminStatus(
    superAdminId: string,
    subAdminId: string,
    newStatus: 'ACTIVE' | 'INACTIVE',
    ipAddress?: string
  ) {
    return withRentalDbRetry(async () => {
      const subAdmin = await rentalPrisma.rentalAdmin.findUnique({
        where: { id: subAdminId },
      });

      if (!subAdmin) {
        throw new Error('Sub Admin not found.');
      }

      if (subAdmin.role === 'SUPER_ADMIN') {
        throw new Error('Cannot change status of a Super Admin through this route.');
      }

      const updated = await rentalPrisma.rentalAdmin.update({
        where: { id: subAdminId },
        data: { status: newStatus },
      });

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: superAdminId,
          action: 'SUB_ADMIN_STATUS_CHANGED',
          target_entity: 'RentalAdmin',
          target_id: subAdminId,
          after_state: JSON.stringify({ oldStatus: subAdmin.status, newStatus }),
          ip_address: ipAddress || 'Unknown',
        },
      });

      invalidateRentalAdminCache(subAdminId);
      rentalCache.invalidate('subadmins:');

      return { id: updated.id, mobile: updated.mobile, status: updated.status };
    });
  }

  /**
   * Delete a Sub Admin permanently (Super Admin only)
   */
  async deleteSubAdmin(superAdminId: string, subAdminId: string, ipAddress?: string) {
    return withRentalDbRetry(async () => {
      const subAdmin = await rentalPrisma.rentalAdmin.findUnique({
        where: { id: subAdminId },
      });

      if (!subAdmin) {
        throw new Error('Sub Admin not found.');
      }

      if (subAdmin.role === 'SUPER_ADMIN') {
        throw new Error('Cannot delete a Super Admin account.');
      }

      await rentalPrisma.$transaction(async (tx) => {
        await tx.rentalAdminAuditLog.deleteMany({
          where: { admin_id: subAdminId },
        });

        await tx.rentalAdmin.delete({
          where: { id: subAdminId },
        });

        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: superAdminId,
            action: 'SUB_ADMIN_DELETED',
            target_entity: 'RentalAdmin',
            target_id: subAdminId,
            after_state: JSON.stringify({
              fullName: subAdmin.full_name,
              mobile: subAdmin.mobile,
              email: subAdmin.email,
            }),
            ip_address: ipAddress || 'Unknown',
          },
        });
      });

      invalidateRentalAdminCache(subAdminId);
      rentalCache.invalidate('subadmins:');

      return { id: subAdminId, mobile: subAdmin.mobile };
    });
  }
}

export const rentalAuthService = new RentalAuthService();
