import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../../shared/config/env';
import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';

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
            username: 'almora_superadmin',
            full_name: 'मुख्य प्रशासनिक अधिकारी (जिला पंचायत अल्मोड़ा)',
            mobile: '9412000001',
            email: 'admin.rental@almora.uk.gov.in',
            passwordHash,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
            permissions: ['*'],
          },
        });

        console.log('🏛️ [Rental DB] Root Super Admin provisioned:', superAdmin.username);
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
      // Ensure root super admin is provisioned
      await this.ensureSuperAdminProvisioned();

      const trimmed = identifier.trim();
      const admin = await rentalPrisma.rentalAdmin.findFirst({
        where: {
          OR: [{ username: trimmed }, { mobile: trimmed }, { email: trimmed }],
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

      // Update last login timestamp
      await rentalPrisma.rentalAdmin.update({
        where: { id: admin.id },
        data: { last_login_at: new Date() },
      });

      // Record administrative audit log
      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: admin.id,
          action: 'ADMIN_LOGIN',
          target_entity: 'RentalAdmin',
          target_id: admin.id,
          ip_address: ipAddress || 'Unknown',
        },
      });

      // Sign JWT token valid for 8 hours
      const token = jwt.sign(
        {
          adminId: admin.id,
          username: admin.username,
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
          username: admin.username,
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
      username: string;
      fullName: string;
      mobile: string;
      email?: string;
      initialPassword: string;
      permissions?: string[];
    },
    ipAddress?: string
  ) {
    return withRentalDbRetry(async () => {
      // Check for existing duplicates
      const existing = await rentalPrisma.rentalAdmin.findFirst({
        where: {
          OR: [
            { username: data.username.trim() },
            { mobile: data.mobile.trim() },
            ...(data.email ? [{ email: data.email.trim() }] : []),
          ],
        },
      });

      if (existing) {
        throw new Error('An administrator with this username, mobile, or email already exists.');
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(data.initialPassword, salt);

      const subAdmin = await rentalPrisma.rentalAdmin.create({
        data: {
          username: data.username.trim(),
          full_name: data.fullName.trim(),
          mobile: data.mobile.trim(),
          email: data.email?.trim() || null,
          passwordHash,
          role: 'SUB_ADMIN',
          status: 'ACTIVE',
          permissions: data.permissions || ['manage_tenants', 'view_bills', 'record_payments'],
        },
      });

      // Audit log
      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: creatorAdminId,
          action: 'SUB_ADMIN_CREATED',
          target_entity: 'RentalAdmin',
          target_id: subAdmin.id,
          after_state: JSON.stringify({ username: subAdmin.username, role: subAdmin.role }),
          ip_address: ipAddress || 'Unknown',
        },
      });

      return {
        id: subAdmin.id,
        username: subAdmin.username,
        fullName: subAdmin.full_name,
        role: subAdmin.role,
        mobile: subAdmin.mobile,
        status: subAdmin.status,
        permissions: subAdmin.permissions,
      };
    });
  }

  /**
   * List all Sub Admins (Super Admin only)
   */
  async listSubAdmins() {
    return withRentalDbRetry(async () => {
      const admins = await rentalPrisma.rentalAdmin.findMany({
        where: { role: 'SUB_ADMIN' },
        select: {
          id: true,
          username: true,
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
        username: a.username,
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
    });
  }

  /**
   * Toggle Sub Admin Status (Active / Inactive) (Super Admin only)
   */
  async toggleSubAdminStatus(superAdminId: string, subAdminId: string, newStatus: 'ACTIVE' | 'INACTIVE', ipAddress?: string) {
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

      return { id: updated.id, username: updated.username, status: updated.status };
    });
  }

  /**
   * Registered Tenant / User Login
   */
  async userLogin(identifier: string, plainPass: string) {
    return withRentalDbRetry(async () => {
      const trimmed = identifier.trim();
      const user = await rentalPrisma.rentalUser.findFirst({
        where: {
          OR: [{ user_id: trimmed }, { mobile: trimmed }],
        },
      });

      if (!user) {
        throw new Error('Invalid User ID / Mobile or password.');
      }

      if (user.status !== 'ACTIVE') {
        throw new Error('Your tenant account is inactive or under verification. Please contact the designated officer.');
      }

      const isMatch = await bcrypt.compare(plainPass, user.passwordHash);
      if (!isMatch) {
        throw new Error('Invalid User ID / Mobile or password.');
      }

      const token = jwt.sign(
        {
          userId: user.id,
          userCode: user.user_id,
          mobile: user.mobile,
          fullName: user.full_name,
          role: 'RENTAL_USER',
        },
        env.JWT_SECRET,
        { expiresIn: '12h' }
      );

      return {
        token,
        user: {
          id: user.id,
          userCode: user.user_id,
          fullName: user.full_name,
          mobile: user.mobile,
          email: user.email,
          profilePhotoUrl: user.profile_photo_url,
          status: user.status,
        },
      };
    });
  }

  /**
   * Tenant Change Password
   */
  async changeUserPassword(userId: string, currentPass: string, newPass: string) {
    return withRentalDbRetry(async () => {
      if (newPass.length < 8) {
        throw new Error('New password must be at least 8 characters long.');
      }

      const user = await rentalPrisma.rentalUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found.');
      }

      const isMatch = await bcrypt.compare(currentPass, user.passwordHash);
      if (!isMatch) {
        throw new Error('Current password does not match.');
      }

      const salt = await bcrypt.genSalt(12);
      const newHash = await bcrypt.hash(newPass, salt);

      await rentalPrisma.rentalUser.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });

      return { success: true, message: 'Password updated successfully.' };
    });
  }

  /**
   * Get Tenant Dashboard Profile (with assigned property and designated officer details)
   */
  async getUserProfile(userId: string) {
    return withRentalDbRetry(async () => {
      const user = await rentalPrisma.rentalUser.findUnique({
        where: { id: userId },
        include: {
          assignments: {
            where: { is_active: true },
            include: { property: true },
          },
          documents: {
            select: {
              id: true,
              doc_type: true,
              file_name: true,
              file_url: true,
              verification_status: true,
              created_at: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('User record not found.');
      }

      // Fetch designated officer for profile change requests
      const officer = await rentalPrisma.rentalDesignatedOfficer.findFirst({
        where: { is_active: true },
        select: {
          full_name: true,
          designation: true,
          department: true,
          office_phone: true,
          official_email: true,
          office_address: true,
          working_hours: true,
          contact_instructions: true,
        },
      });

      return {
        id: user.id,
        userCode: user.user_id,
        fullName: user.full_name,
        mobile: user.mobile,
        email: user.email,
        profilePhotoUrl: user.profile_photo_url,
        permanentAddress: user.permanent_address,
        currentAddress: user.current_address,
        aadhaarMasked: user.aadhaar_masked,
        panMasked: user.pan_masked,
        gstNumber: user.gst_number,
        status: user.status,
        activeProperty: user.assignments[0]
          ? {
              propertyId: user.assignments[0].property.property_id,
              propertyName: user.assignments[0].property.property_name,
              propertyType: user.assignments[0].property.property_type,
              location: user.assignments[0].property.location,
              monthlyRent: user.assignments[0].monthly_rent,
              allotmentDate: user.assignments[0].allotment_date,
            }
          : null,
        documents: user.documents,
        designatedOfficer: officer || {
          full_name: 'अपर मुख्य अधिकारी (कार्यालय जिला पंचायत अल्मोड़ा)',
          designation: 'Designated Rental In-charge',
          department: 'संपत्ति एवं किराया अनुभाग',
          office_phone: '+91-5962-230054',
          official_email: 'zp-almora-uk@nic.in',
          office_address: 'जिला पंचायत परिसर, निकट माल रोड, अल्मोड़ा, उत्तराखंड - 263601',
          working_hours: 'प्रातः 10:00 बजे से सायं 5:00 बजे तक (सोमवार से शनिवार)',
        },
      };
    });
  }
}

export const rentalAuthService = new RentalAuthService();
