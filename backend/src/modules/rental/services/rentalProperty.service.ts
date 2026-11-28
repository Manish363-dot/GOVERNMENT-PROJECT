import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { normalizeDigitsToAscii } from '../../../shared/utils/transliterate.util';
import { rentalCache } from '../utils/rentalCache.util';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const deleteShopS3Keys = async (keys: string[]) => {
  const valid = Array.from(new Set((keys || []).filter(Boolean)));
  if (valid.length === 0) return;
  const bucket = process.env.AWS_S3_BUCKET_NAME || 'zila-panchayat-images';
  try {
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucket,
        Delete: {
          Objects: valid.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );
  } catch (err) {
    console.warn('[RentalProperty S3 Cleanup Warning]:', err);
  }
};

export interface CreatePropertyDTO {
  propertyName?: string;
  propertyType?: 'COMMERCIAL_SHOP' | 'ROADSIDE_STALL' | 'WAREHOUSE_GODOWN' | 'LAND_PARCEL' | 'OFFICE_SPACE' | 'OTHER';
  propertyNumber: string;
  location?: string;
  address: string;
  dimensionsSqft?: number;
  baseMonthlyRent: number;
  uploadedPhotos?: Array<{ url: string; key: string }>;
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
      const cleanNum = dto.propertyNumber.trim().replace(/\s+/g, '-').toUpperCase();
      const propertyId = `${prefix}-${cleanNum}-${(count + 1).toString().padStart(3, '0')}`;

      // Check duplicate shop code
      const existing = await rentalPrisma.rentalProperty.findFirst({
        where: {
          property_number: dto.propertyNumber.trim(),
        },
      });

      if (existing) {
        throw new Error(`Shop code ${dto.propertyNumber.trim()} is already registered.`);
      }

      // Preserve user-entered text (translation happens explicitly via the Globe button only) and keep 123 digits
      const hasCustomName = Boolean(dto.propertyName && dto.propertyName.trim());
      const hasCustomLocation = Boolean(dto.location && dto.location.trim());

      const finalAddress = normalizeDigitsToAscii(dto.address.trim());
      const finalName = hasCustomName
        ? normalizeDigitsToAscii(dto.propertyName!.trim())
        : normalizeDigitsToAscii(dto.propertyNumber.trim());
      const finalLocation = hasCustomLocation
        ? normalizeDigitsToAscii(dto.location!.trim())
        : finalAddress;

      const photos = (dto.uploadedPhotos || []).slice(0, 3);
      const photoUrls = photos.map((p) => p.url);
      const photoKeys = photos.map((p) => p.key);

      const property = await rentalPrisma.rentalProperty.create({
        data: {
          property_id: propertyId,
          property_name: finalName,
          property_type: dto.propertyType || 'COMMERCIAL_SHOP',
          property_number: dto.propertyNumber.trim(),
          location: finalLocation,
          address: finalAddress,
          dimensions_sqft: dto.dimensionsSqft ? Number(dto.dimensionsSqft) : null,
          base_monthly_rent: Number(dto.baseMonthlyRent),
          photo_urls: photoUrls,
          photo_keys: photoKeys,
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

      rentalCache.invalidate('properties:', 'overview:', 'analytics:', 'tenants:', 'ledger:');
      return property;
    });
  }

  /**
   * List properties with search, type, and status filtering (flat queries + short cache)
   */
  async listProperties(params: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const statusKey = params.status || 'ALL';
    const typeKey = params.type || 'ALL';
    const searchKey = (params.search || '').trim().toLowerCase();
    const cacheKey = `properties:${page}:${limit}:${statusKey}:${typeKey}:${searchKey}`;

    return rentalCache.getOrSet(cacheKey, 15_000, () =>
      withRentalDbRetry(async () => {
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
            select: {
              id: true,
              property_id: true,
              property_name: true,
              property_type: true,
              property_number: true,
              location: true,
              address: true,
              dimensions_sqft: true,
              base_monthly_rent: true,
              photo_urls: true,
              status: true,
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit,
          }),
        ]);

        const propIds = properties.map((p) => p.id);
        const activeAssignments = propIds.length > 0
          ? await rentalPrisma.propertyAssignment.findMany({
              where: { property_id: { in: propIds }, is_active: true },
              select: {
                property_id: true,
                monthly_rent: true,
                lease_start_date: true,
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
            })
          : [];

        const assignByProp = new Map(activeAssignments.map((a) => [a.property_id, a]));

        const formatted = properties.map((p) => {
          const currentAssignment = assignByProp.get(p.id);
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
            photoUrls: p.photo_urls || [],
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
      })
    );
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
    }).then((res) => {
      rentalCache.invalidate('properties:', 'overview:', 'analytics:', 'tenants:', 'ledger:');
      return res;
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
    }).then((res) => {
      rentalCache.invalidate('properties:', 'overview:', 'analytics:', 'tenants:', 'ledger:');
      return res;
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
    }).then((res) => {
      rentalCache.invalidate('properties:', 'overview:', 'analytics:', 'tenants:', 'ledger:');
      return res;
    });
  }

  /**
   * Public endpoint: returns ONLY currently VACANT (available, unallotted) shops for the Landing Page.
   * Automatically excludes any shop the moment it is allotted to a tenant.
   */
  async listPublicAvailableProperties() {
    return rentalCache.getOrSet('properties:public:available', 10_000, () =>
      withRentalDbRetry(async () => {
        const vacantProps = await rentalPrisma.rentalProperty.findMany({
          where: {
            status: 'VACANT',
            assignments: {
              none: { is_active: true },
            },
          },
          select: {
            id: true,
            property_id: true,
            property_name: true,
            property_type: true,
            property_number: true,
            location: true,
            address: true,
            dimensions_sqft: true,
            base_monthly_rent: true,
            photo_urls: true,
            created_at: true,
          },
          orderBy: { created_at: 'desc' },
        });

        return vacantProps.map((p) => ({
          id: p.id,
          propertyId: p.property_id,
          propertyName: p.property_name,
          propertyType: p.property_type,
          propertyNumber: p.property_number,
          location: p.location,
          address: p.address,
          dimensionsSqft: p.dimensions_sqft,
          baseMonthlyRent: Number(p.base_monthly_rent),
          photoUrls: p.photo_urls || [],
          createdAt: p.created_at,
        }));
      })
    );
  }

  /**
   * Update up to 3 photos on an existing property (adds new S3 photos & deletes removed S3 keys)
   */
  async updatePropertyPhotos(
    adminId: string,
    propertyId: string,
    keepUrls: string[],
    newPhotos: Array<{ url: string; key: string }>,
    clientIp?: string
  ) {
    return withRentalDbRetry(async () => {
      const property = await rentalPrisma.rentalProperty.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          property_number: true,
          photo_urls: true,
          photo_keys: true,
        },
      });

      if (!property) {
        throw new Error('Property not found.');
      }

      const existingUrls = property.photo_urls || [];
      const existingKeys = property.photo_keys || [];

      const keptUrls: string[] = [];
      const keptKeys: string[] = [];
      const keysToDelete: string[] = [];

      existingUrls.forEach((url, idx) => {
        const key = existingKeys[idx] || '';
        if (keepUrls.includes(url)) {
          keptUrls.push(url);
          keptKeys.push(key);
        } else if (key) {
          keysToDelete.push(key);
        }
      });

      const finalUrls = [...keptUrls, ...newPhotos.map((p) => p.url)].slice(0, 3);
      const finalKeys = [...keptKeys, ...newPhotos.map((p) => p.key)].slice(0, 3);

      const updated = await rentalPrisma.rentalProperty.update({
        where: { id: propertyId },
        data: {
          photo_urls: finalUrls,
          photo_keys: finalKeys,
        },
      });

      if (keysToDelete.length > 0) {
        await deleteShopS3Keys(keysToDelete);
      }

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: adminId,
          action: 'PROPERTY_PHOTOS_UPDATED',
          target_entity: 'RentalProperty',
          target_id: propertyId,
          after_state: JSON.stringify({
            propertyNumber: property.property_number,
            photoCount: finalUrls.length,
          }),
          ip_address: clientIp || 'Unknown',
        },
      });

      rentalCache.invalidate('properties:', 'overview:', 'analytics:');
      return {
        id: updated.id,
        photoUrls: updated.photo_urls,
      };
    });
  }

  /**
   * Delete a commercial property asset permanently
   */
  async deleteProperty(adminId: string, propertyId: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const property = await rentalPrisma.rentalProperty.findUnique({
        where: { id: propertyId },
        select: {
          id: true,
          property_number: true,
          property_name: true,
          location: true,
          photo_keys: true,
        },
      });

      if (!property) {
        throw new Error('Property not found');
      }

      return rentalPrisma.$transaction(
        async (tx) => {
          await Promise.all([
            tx.propertyAssignment.deleteMany({ where: { property_id: propertyId } }),
            tx.rentChangeHistory.deleteMany({ where: { property_id: propertyId } }),
            tx.rentalReceipt.deleteMany({ where: { property_id: propertyId } }),
            tx.paymentAuditTrail.deleteMany({ where: { property_id: propertyId } }),
            tx.rentalLedgerEntry.deleteMany({ where: { property_id: propertyId } }),
          ]);

          await Promise.all([
            tx.rentalPayment.deleteMany({ where: { property_id: propertyId } }),
            tx.rentalBill.deleteMany({ where: { property_id: propertyId } }),
          ]);

          await Promise.all([
            tx.rentalProperty.delete({ where: { id: propertyId } }),
            tx.rentalAdminAuditLog.create({
              data: {
                admin_id: adminId,
                action: 'PROPERTY_DELETED',
                target_entity: 'RentalProperty',
                target_id: propertyId,
                reason: `Property ${property.property_number} (${property.property_name}) deleted by admin`,
                before_state: JSON.stringify({
                  propertyNumber: property.property_number,
                  propertyName: property.property_name,
                  location: property.location,
                }),
                after_state: JSON.stringify({ deleted: true }),
                ip_address: clientIp || 'Unknown',
              },
            }),
          ]);

          return { success: true, message: 'Property deleted successfully', photoKeys: property.photo_keys || [] };
        },
        { maxWait: 10000, timeout: 30000 }
      );
    }).then(async (res) => {
      if (res.photoKeys && res.photoKeys.length > 0) {
        await deleteShopS3Keys(res.photoKeys);
      }
      rentalCache.invalidate('properties:', 'overview:', 'analytics:', 'tenants:', 'ledger:');
      return { success: res.success, message: res.message };
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
