import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';

export interface CreatePropertyDTO {
  propertyName: string;
  propertyType?: 'COMMERCIAL_SHOP' | 'ROADSIDE_STALL' | 'WAREHOUSE_GODOWN' | 'LAND_PARCEL' | 'OFFICE_SPACE' | 'OTHER';
  propertyNumber: string;
  location: string;
  address: string;
  dimensionsSqft?: number;
  baseMonthlyRent: number;
}

export class RentalPropertyService {
  /**
   * Create a new commercial property asset in Database A
   */
  async createProperty(adminId: string, dto: CreatePropertyDTO, clientIp?: string) {
    return withRentalDbRetry(async () => {
      // Generate unique Property ID: SHOP-MKT-XXXX or PROP-YYYY-XXXX
      const count = await rentalPrisma.rentalProperty.count();
      const prefix = dto.propertyType === 'ROADSIDE_STALL' ? 'STALL' : dto.propertyType === 'COMMERCIAL_SHOP' ? 'SHOP' : 'PROP';
      const cleanNum = dto.propertyNumber.replace(/\s+/g, '-').toUpperCase();
      const propertyId = `${prefix}-${cleanNum}-${(count + 1).toString().padStart(3, '0')}`;

      // Check duplicate property number in the same location
      const existing = await rentalPrisma.rentalProperty.findFirst({
        where: {
          property_number: dto.propertyNumber.trim(),
          location: dto.location.trim(),
        },
      });

      if (existing) {
        throw new Error(`Property ${dto.propertyNumber} already exists in ${dto.location}.`);
      }

      const property = await rentalPrisma.rentalProperty.create({
        data: {
          property_id: propertyId,
          property_name: dto.propertyName.trim(),
          property_type: dto.propertyType || 'COMMERCIAL_SHOP',
          property_number: dto.propertyNumber.trim(),
          location: dto.location.trim(),
          address: dto.address.trim(),
          dimensions_sqft: dto.dimensionsSqft ? Number(dto.dimensionsSqft) : null,
          base_monthly_rent: Number(dto.baseMonthlyRent),
          status: 'VACANT',
        },
      });

      // Audit Log
      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: adminId,
          action: 'PROPERTY_CREATED',
          target_entity: 'RentalProperty',
          target_id: property.id,
          after_state: JSON.stringify({
            propertyId: property.property_id,
            propertyNumber: property.property_number,
            location: property.location,
            baseRent: property.base_monthly_rent,
          }),
          ip_address: clientIp || 'Unknown',
        },
      });

      return property;
    });
  }

  /**
   * List properties with search, type, and status filtering
   */
  async listProperties(params: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    return withRentalDbRetry(async () => {
      const page = Math.max(1, params.page || 1);
      const limit = Math.min(100, Math.max(1, params.limit || 20));
      const skip = (page - 1) * limit;

      const where: any = {};
      if (params.status && params.status !== 'ALL') {
        where.status = params.status;
      }
      if (params.type && params.type !== 'ALL') {
        where.property_type = params.type;
      }

      if (params.search && params.search.trim()) {
        const s = params.search.trim();
        where.OR = [
          { property_name: { contains: s, mode: 'insensitive' } },
          { property_number: { contains: s, mode: 'insensitive' } },
          { property_id: { contains: s, mode: 'insensitive' } },
          { location: { contains: s, mode: 'insensitive' } },
        ];
      }

      const [total, properties] = await Promise.all([
        rentalPrisma.rentalProperty.count({ where }),
        rentalPrisma.rentalProperty.findMany({
          where,
          include: {
            assignments: {
              where: { is_active: true },
              include: {
                user: {
                  select: {
                    id: true,
                    user_id: true,
                    full_name: true,
                    mobile: true,
                    profile_photo_url: true,
                  },
                },
              },
            },
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      const formatted = properties.map((p) => {
        const currentAssignment = p.assignments[0];
        return {
          id: p.id,
          propertyId: p.property_id,
          propertyName: p.property_name,
          propertyType: p.property_type,
          propertyNumber: p.property_number,
          location: p.location,
          address: p.address,
          dimensionsSqft: p.dimensions_sqft,
          baseMonthlyRent: Number(p.base_monthly_rent),
          status: p.status,
          currentTenant: currentAssignment
            ? {
                userId: currentAssignment.user.id,
                userCode: currentAssignment.user.user_id,
                fullName: currentAssignment.user.full_name,
                mobile: currentAssignment.user.mobile,
                profilePhotoUrl: currentAssignment.user.profile_photo_url,
                activeRent: Number(currentAssignment.monthly_rent),
                leaseStartDate: currentAssignment.lease_start_date,
              }
            : null,
        };
      });

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        data: formatted,
      };
    });
  }

  /**
   * Get single property details with assignment history & rent revision records
   */
  async getPropertyDetails(propertyId: string) {
    return withRentalDbRetry(async () => {
      const property = await rentalPrisma.rentalProperty.findUnique({
        where: { id: propertyId },
        include: {
          assignments: {
            include: {
              user: {
                select: {
                  id: true,
                  user_id: true,
                  full_name: true,
                  mobile: true,
                  profile_photo_url: true,
                },
              },
            },
            orderBy: { created_at: 'desc' },
          },
          rentChangeHistory: {
            include: {
              user: {
                select: {
                  id: true,
                  user_id: true,
                  full_name: true,
                },
              },
            },
            orderBy: { effective_date: 'desc' },
          },
        },
      });

      if (!property) {
        throw new Error('Property asset not found.');
      }

      return property;
    });
  }

  /**
   * Allot / Assign property to a registered tenant
   */
  async assignProperty(
    adminId: string,
    data: {
      propertyId: string;
      userId: string;
      monthlyRent?: number;
      leaseStartDate: string;
      leaseEndDate?: string;
    },
    clientIp?: string
  ) {
    return withRentalDbRetry(async () => {
      const { propertyId, userId, monthlyRent, leaseStartDate, leaseEndDate } = data;

      return rentalPrisma.$transaction(async (tx) => {
        const property = await tx.rentalProperty.findUnique({
          where: { id: propertyId },
        });

        if (!property) {
          throw new Error('Property not found.');
        }

        if (property.status === 'ALLOTTED') {
          throw new Error(`Property ${property.property_number} is already allotted to an active tenant.`);
        }

        const user = await tx.rentalUser.findUnique({
          where: { id: userId },
        });

        if (!user) {
          throw new Error('Tenant record not found.');
        }

        if (user.status !== 'ACTIVE') {
          throw new Error('Cannot allot property to an inactive tenant.');
        }

        const agreedRent = monthlyRent ? Number(monthlyRent) : Number(property.base_monthly_rent);

        const assignment = await tx.propertyAssignment.create({
          data: {
            property_id: property.id,
            user_id: user.id,
            monthly_rent: agreedRent,
            lease_start_date: new Date(leaseStartDate),
            lease_end_date: leaseEndDate ? new Date(leaseEndDate) : null,
            is_active: true,
            assigned_by: adminId,
          },
        });

        await tx.rentalProperty.update({
          where: { id: property.id },
          data: { status: 'ALLOTTED' },
        });

        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: adminId,
            action: 'PROPERTY_ALLOTTED',
            target_entity: 'PropertyAssignment',
            target_id: assignment.id,
            after_state: JSON.stringify({
              propertyId: property.property_id,
              userId: user.user_id,
              rent: agreedRent,
              leaseStart: leaseStartDate,
            }),
            ip_address: clientIp || 'Unknown',
          },
        });

        return assignment;
      });
    });
  }

  /**
   * Unassign / Vacate a commercial property
   */
  async unassignProperty(adminId: string, propertyId: string, reason: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      return rentalPrisma.$transaction(async (tx) => {
        const activeAssignment = await tx.propertyAssignment.findFirst({
          where: { property_id: propertyId, is_active: true },
        });

        if (!activeAssignment) {
          throw new Error('No active assignment found for this property.');
        }

        await tx.propertyAssignment.update({
          where: { id: activeAssignment.id },
          data: {
            is_active: false,
            deactivated_at: new Date(),
            deactivation_reason: reason.trim(),
          },
        });

        await tx.rentalProperty.update({
          where: { id: propertyId },
          data: { status: 'VACANT' },
        });

        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: adminId,
            action: 'PROPERTY_VACATED',
            target_entity: 'PropertyAssignment',
            target_id: activeAssignment.id,
            reason: reason.trim(),
            ip_address: clientIp || 'Unknown',
          },
        });

        return { success: true, message: 'Property vacated successfully and marked VACANT.' };
      });
    });
  }

  /**
   * Change Rent with Full Historical Integrity & Audit Trail
   * As specified: Issued bills and settled ledgers remain unaltered.
   * New rent takes effect strictly from the effective date forward.
   */
  async changeRent(
    adminId: string,
    data: {
      propertyId: string;
      userId: string;
      newRent: number;
      effectiveDate: string;
      reason: string;
      requestedBy?: string;
    },
    clientIp?: string
  ) {
    return withRentalDbRetry(async () => {
      const { propertyId, userId, newRent, effectiveDate, reason, requestedBy } = data;

      return rentalPrisma.$transaction(async (tx) => {
        const assignment = await tx.propertyAssignment.findFirst({
          where: {
            property_id: propertyId,
            user_id: userId,
            is_active: true,
          },
        });

        if (!assignment) {
          throw new Error('Active property assignment not found for this tenant.');
        }

        const previousRent = Number(assignment.monthly_rent);
        const revisedRent = Number(newRent);

        if (previousRent === revisedRent) {
          throw new Error('The new rent amount must be different from the current rent amount.');
        }

        // 1. Record in RentChangeHistory (append-only)
        const historyRecord = await tx.rentChangeHistory.create({
          data: {
            user_id: userId,
            property_id: propertyId,
            previous_rent: previousRent,
            new_rent: revisedRent,
            effective_date: new Date(effectiveDate),
            reason: reason.trim(),
            approved_by: adminId,
            requested_by: requestedBy || null,
          },
        });

        // 2. Update active assignment monthly rent
        await tx.propertyAssignment.update({
          where: { id: assignment.id },
          data: { monthly_rent: revisedRent },
        });

        // 3. Update base rent on property if applicable
        await tx.rentalProperty.update({
          where: { id: propertyId },
          data: { base_monthly_rent: revisedRent },
        });

        // 4. Record Admin Audit Log
        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: adminId,
            action: 'RENT_REVISED',
            target_entity: 'RentChangeHistory',
            target_id: historyRecord.id,
            reason: reason.trim(),
            before_state: JSON.stringify({ previousRent }),
            after_state: JSON.stringify({ newRent: revisedRent, effectiveDate }),
            ip_address: clientIp || 'Unknown',
          },
        });

        return {
          historyId: historyRecord.id,
          previousRent,
          newRent: revisedRent,
          effectiveDate,
          reason,
        };
      });
    });
  }

  /**
   * Get Chronological Rent Change Audit History for a property or tenant
   */
  async getRentHistory(filter: { propertyId?: string; userId?: string }) {
    return withRentalDbRetry(async () => {
      const where: any = {};
      if (filter.propertyId) where.property_id = filter.propertyId;
      if (filter.userId) where.user_id = filter.userId;

      return rentalPrisma.rentChangeHistory.findMany({
        where,
        include: {
          user: {
            select: { id: true, user_id: true, full_name: true, mobile: true },
          },
          property: {
            select: { id: true, property_id: true, property_number: true, location: true },
          },
        },
        orderBy: { effective_date: 'desc' },
      });
    });
  }
}

export const rentalPropertyService = new RentalPropertyService();
