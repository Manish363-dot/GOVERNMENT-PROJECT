import bcrypt from 'bcryptjs';
import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { S3Client, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { calculateRentWithGst, resolveBillAmounts } from '../utils/gst.util';
import { rentalCache } from '../utils/rentalCache.util';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const extractS3Key = (directKey?: string | null, url?: string | null): string | null => {
  if (directKey && directKey.trim()) {
    return directKey.trim().replace(/^\/+/, '');
  }
  if (url && url.includes('.amazonaws.com/')) {
    try {
      const parsed = new URL(url);
      const pathname = decodeURIComponent(parsed.pathname).replace(/^\/+/, '');
      return pathname || null;
    } catch {
      return null;
    }
  }
  return null;
};

const deleteS3Objects = async (keys: string[]): Promise<number> => {
  const uniqueKeys = Array.from(new Set(keys.filter(Boolean)));
  if (uniqueKeys.length === 0) return 0;

  const bucket = process.env.AWS_S3_BUCKET_NAME || 'zila-panchayat-images';
  let deletedCount = 0;

  // S3 DeleteObjects supports up to 1000 keys per request
  for (let i = 0; i < uniqueKeys.length; i += 1000) {
    const batch = uniqueKeys.slice(i, i + 1000);
    try {
      const res = await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: batch.map((Key) => ({ Key })),
            Quiet: false,
          },
        })
      );
      deletedCount += res.Deleted?.length ?? batch.length;
      if (res.Errors && res.Errors.length > 0) {
        console.error('[Rental S3 Cleanup Partial Errors]:', res.Errors);
      }
    } catch (err) {
      console.error('[Rental S3 Cleanup Error]:', err);
    }
  }

  return deletedCount;
};

export interface RegisterUserDTO {
  fullName: string;
  mobile: string;
  email?: string;
  permanentAddress: string;
  currentAddress?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  gstNumber?: string;
  propertyId?: string;
  monthlyRent?: number;
  rentEffectiveDate?: string;
  allotmentDate?: string;
  leaseEndDate?: string;
  initialPassword?: string;
}

export class RentalUserService {
  /**
   * Register a new rental tenant with optional property allocation & uploaded documents.
   * Only authorized administrators can register users.
   */
  async registerTenant(
    adminId: string,
    dto: RegisterUserDTO,
    files: {
      profilePhoto?: { location: string; key: string; size: number; mimetype: string };
      aadhaarDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      panDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      domicileDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      gstDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      shopPhoto?: { location: string; key: string; size: number; mimetype: string; originalname: string };
    },
    clientIp?: string
  ) {
    return withRentalDbRetry(async () => {
      // 1. Check duplicate mobile number in Database A
      const existingUser = await rentalPrisma.rentalUser.findFirst({
        where: { mobile: dto.mobile.trim() },
      });

      if (existingUser) {
        throw new Error(`A tenant with mobile number ${dto.mobile} is already registered.`);
      }

      // 2. Generate unique User Code: ALM-RENT-YYYY-XXXX
      const currentYear = new Date().getFullYear();
      const count = await rentalPrisma.rentalUser.count();
      const userCode = `ALM-RENT-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

      // 3. Mask sensitive identifiers for storage & display
      const aadhaarRaw = dto.aadhaarNumber?.replace(/\D/g, '') || '';
      const aadhaarMasked = aadhaarRaw.length === 12
        ? `XXXX-XXXX-${aadhaarRaw.slice(8)}`
        : null;

      const panRaw = dto.panNumber?.trim().toUpperCase() || '';
      const panMasked = panRaw.length === 10
        ? `XXXXX${panRaw.slice(5)}`
        : null;

      // 4. Hash initial login password
      const plainPassword = dto.initialPassword?.trim() || `Almora@${dto.mobile.slice(-4)}`;
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(plainPassword, salt);

      // 4.1 Auto-transliterate English name and addresses to Hindi Devanagari script
      const { transliterateToHindi } = await import('../../../shared/utils/transliterate.util');
      const finalFullName = await transliterateToHindi(dto.fullName.trim());
      const finalPermanentAddress = await transliterateToHindi(dto.permanentAddress.trim());
      const finalCurrentAddress = dto.currentAddress ? await transliterateToHindi(dto.currentAddress.trim()) : null;

      // 5. Atomic database transaction
      const createdUser = await rentalPrisma.$transaction(async (tx) => {
        const user = await tx.rentalUser.create({
          data: {
            user_id: userCode,
            full_name: finalFullName,
            mobile: dto.mobile.trim(),
            email: dto.email?.trim() || null,
            passwordHash,
            profile_photo_url: files.profilePhoto?.location || null,
            profile_photo_key: files.profilePhoto?.key || null,
            permanent_address: finalPermanentAddress,
            current_address: finalCurrentAddress,
            aadhaar_masked: aadhaarMasked,
            pan_masked: panMasked,
            gst_number: dto.gstNumber?.trim().toUpperCase() || null,
            status: 'ACTIVE',
          },
        });

        // Save uploaded identity documents
        const docsToCreate = [];
        if (files.aadhaarDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'AADHAAR' as const,
            file_url: files.aadhaarDoc.location,
            s3_key: files.aadhaarDoc.key,
            file_name: files.aadhaarDoc.originalname || 'Aadhaar_Card.pdf',
            file_size: files.aadhaarDoc.size,
            mime_type: files.aadhaarDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files.panDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'PAN' as const,
            file_url: files.panDoc.location,
            s3_key: files.panDoc.key,
            file_name: files.panDoc.originalname || 'PAN_Card.pdf',
            file_size: files.panDoc.size,
            mime_type: files.panDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files.domicileDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'DOMICILE' as const,
            file_url: files.domicileDoc.location,
            s3_key: files.domicileDoc.key,
            file_name: files.domicileDoc.originalname || 'Domicile_Certificate.pdf',
            file_size: files.domicileDoc.size,
            mime_type: files.domicileDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files.gstDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'GST' as const,
            file_url: files.gstDoc.location,
            s3_key: files.gstDoc.key,
            file_name: files.gstDoc.originalname || 'GST_Certificate.pdf',
            file_size: files.gstDoc.size,
            mime_type: files.gstDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files.shopPhoto) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'OTHER' as const,
            file_url: files.shopPhoto.location,
            s3_key: files.shopPhoto.key,
            file_name: files.shopPhoto.originalname || 'Shop_Photo.webp',
            file_size: files.shopPhoto.size,
            mime_type: files.shopPhoto.mimetype,
            verification_status: 'PENDING' as const,
          });
        }

        if (docsToCreate.length > 0) {
          await tx.rentalUserDocument.createMany({
            data: docsToCreate,
          });
        }

        // Property Assignment Check & Enforcement
        if (!dto.propertyId) {
          throw new Error('किरायेदार आवंटन के लिए दुकान / परिसंपत्ति का चयन अनिवार्य है। (Shop selection is required)');
        }

        const property = await tx.rentalProperty.findFirst({
          where: {
            OR: [
              { id: dto.propertyId },
              { property_id: dto.propertyId },
              { property_number: dto.propertyId },
            ],
          },
        });

        if (!property) {
          throw new Error('चयनित दुकान / परिसंपत्ति जिला पंचायत रिकॉर्ड में पंजीकृत नहीं है। किरायेदार को आवंटित करने से पहले कृपया संपत्ति प्रबंधन में जाकर नई दुकान पंजीकृत करें। (Selected shop is not registered in the system. Please register the property first.)');
        }

        // Verify that the shop is not currently allotted to anyone else
        const activeAssignment = await tx.propertyAssignment.findFirst({
          where: {
            property_id: property.id,
            is_active: true,
          },
          include: {
            user: {
              select: { full_name: true, user_id: true },
            },
          },
        });

        if (property.status !== 'VACANT' || activeAssignment) {
          const tenantInfo = activeAssignment?.user?.full_name ? ` (वर्तमान किरायेदार: ${activeAssignment.user.full_name})` : '';
          throw new Error(
            `दुकान संख्या ${property.property_number} (${property.property_name}) वर्तमान में पहले से किसी किरायेदार को आवंटित है${tenantInfo}। जब तक यह दुकान रिक्त (Vacant) नहीं हो जाती, इसे नये किरायेदार को आवंटित नहीं किया जा सकता।`
          );
        }

        const rent = dto.monthlyRent ? Number(dto.monthlyRent) : Number(property.base_monthly_rent);
        const startRaw = dto.allotmentDate?.trim() || dto.rentEffectiveDate?.trim();
        const leaseStart = startRaw ? new Date(startRaw) : new Date();
        const leaseEnd = dto.leaseEndDate?.trim() ? new Date(dto.leaseEndDate.trim()) : null;

        if (leaseEnd && !isNaN(leaseEnd.getTime()) && !isNaN(leaseStart.getTime()) && leaseEnd < leaseStart) {
          throw new Error('दुकान आवंटन समाप्ति तिथि, आवंटन तिथि से पहले नहीं हो सकती। (Allotment end date cannot be before allotment date.)');
        }

        const createdAssignment = await tx.propertyAssignment.create({
          data: {
            property_id: property.id,
            user_id: user.id,
            monthly_rent: rent,
            allotment_date: leaseStart,
            lease_start_date: leaseStart,
            lease_end_date: leaseEnd && !isNaN(leaseEnd.getTime()) ? leaseEnd : null,
            is_active: true,
            assigned_by: adminId,
          },
        });

        // Mark property as ALLOTTED
        await tx.rentalProperty.update({
          where: { id: property.id },
          data: { status: 'ALLOTTED' },
        });

        // Automatically generate initial PENDING monthly demand bill so new user is NOT shown as ₹0 / Paid
        const billDate = !isNaN(leaseStart.getTime()) ? leaseStart : new Date();
        const billYear = billDate.getFullYear();
        const billMonthNum = billDate.getMonth() + 1;
        const billingMonthStr = `${billYear}-${String(billMonthNum).padStart(2, '0')}`;
        const dueDate = new Date(billYear, billMonthNum - 1, 20, 23, 59, 59);
        const billNumber = `BL-${property.property_number}-${billingMonthStr}`;
        const { gstRate, gstAmount, totalWithGst } = calculateRentWithGst(rent);

        const initialBill = await tx.rentalBill.create({
          data: {
            bill_number: billNumber,
            user_id: user.id,
            property_id: property.id,
            assignment_id: createdAssignment.id,
            billing_month: billingMonthStr,
            billing_year: billYear,
            rent_amount: rent,
            gst_rate: gstRate,
            gst_amount: gstAmount,
            adjustment_amount: 0.0,
            total_amount_due: totalWithGst,
            amount_paid: 0.0,
            balance_due: totalWithGst,
            due_date: dueDate,
            status: 'PENDING',
          },
        });

        await tx.rentalLedgerEntry.create({
          data: {
            user_id: user.id,
            property_id: property.id,
            bill_id: initialBill.id,
            entry_type: 'RENT_CHARGE',
            debit: totalWithGst,
            credit: 0.0,
            running_balance: rent,
            description: `Initial Monthly Commercial Rent Demand for ${billingMonthStr} (${property.property_number})`,
            transaction_reference: billNumber,
          },
        });

        // Administrative Audit Trail
        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: adminId,
            action: 'TENANT_REGISTERED',
            target_entity: 'RentalUser',
            target_id: user.id,
            after_state: JSON.stringify({
              userCode: user.user_id,
              fullName: user.full_name,
              mobile: user.mobile,
              propertyId: dto.propertyId || null,
            }),
            ip_address: clientIp || 'Unknown',
          },
        });

        return user;
      });

      rentalCache.invalidate('tenants:', 'overview:', 'analytics:', 'properties:', 'ledger:');

      return {
        id: createdUser.id,
        userCode: createdUser.user_id,
        fullName: createdUser.full_name,
        mobile: createdUser.mobile,
        status: createdUser.status,
        initialPassword: plainPassword,
      };
    });
  }

  /**
   * Search and list tenants with pagination and filters (flattened queries + 15s cache)
   */
  async listTenants(params: {
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const searchKey = (params.search || '').trim().toLowerCase();
    const cacheKey = `tenants:${page}:${limit}:${searchKey}`;

    return rentalCache.getOrSet(cacheKey, 15_000, () =>
      withRentalDbRetry(async () => {
        const skip = (page - 1) * limit;

        const where: any = {};
        if (params.search && params.search.trim()) {
          const s = params.search.trim();
          where.OR = [
            { full_name: { contains: s, mode: 'insensitive' } },
            { mobile: { contains: s } },
            { user_id: { contains: s, mode: 'insensitive' } },
          ];
        }

        const [total, users] = await Promise.all([
          rentalPrisma.rentalUser.count({ where }),
          rentalPrisma.rentalUser.findMany({
            where,
            select: {
              id: true,
              user_id: true,
              full_name: true,
              mobile: true,
              email: true,
              profile_photo_url: true,
              permanent_address: true,
              current_address: true,
              status: true,
              created_at: true,
            },
            orderBy: { created_at: 'desc' },
            skip,
            take: limit,
          }),
        ]);

        const userIds = users.map((u) => u.id);
        const [assignments, unpaidBills, billedUserIds] = userIds.length > 0
          ? await Promise.all([
              rentalPrisma.propertyAssignment.findMany({
                where: { user_id: { in: userIds }, is_active: true },
                select: {
                  id: true,
                  user_id: true,
                  property_id: true,
                  monthly_rent: true,
                  property: {
                    select: {
                      id: true,
                      property_id: true,
                      property_name: true,
                      property_number: true,
                      location: true,
                      address: true,
                    },
                  },
                },
              }),
              rentalPrisma.rentalBill.findMany({
                where: {
                  user_id: { in: userIds },
                  status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
                },
                select: {
                  user_id: true,
                  rent_amount: true,
                  gst_amount: true,
                  adjustment_amount: true,
                  total_amount_due: true,
                  amount_paid: true,
                  balance_due: true,
                  status: true,
                },
              }),
              rentalPrisma.rentalBill.groupBy({
                by: ['user_id'],
                where: { user_id: { in: userIds } },
              }),
            ])
          : [[], [], []];

        const assignByUser = new Map(assignments.map((a) => [a.user_id, a]));
        const hasAnyBillSet = new Set(billedUserIds.map((b) => b.user_id));

        const unpaidSumByUser = new Map<string, number>();
        for (const b of unpaidBills) {
          const bal = resolveBillAmounts(b).balanceDue;
          unpaidSumByUser.set(b.user_id, (unpaidSumByUser.get(b.user_id) || 0) + bal);
        }

        // Batch auto-provision missing initial bills (if any) without sequential loops
        const now = new Date();
        const curYear = now.getFullYear();
        const curMonthNum = now.getMonth() + 1;
        const curMonthStr = `${curYear}-${String(curMonthNum).padStart(2, '0')}`;
        const curDueDate = new Date(curYear, curMonthNum - 1, 20, 23, 59, 59);
        const missingInitialBills: any[] = [];

        for (const u of users) {
          const activeAssign = assignByUser.get(u.id);
          if (activeAssign && !hasAnyBillSet.has(u.id)) {
            const rentAmt = Number(activeAssign.monthly_rent);
            const { gstRate, gstAmount, totalWithGst } = calculateRentWithGst(rentAmt);
            missingInitialBills.push({
              bill_number: `BL-${activeAssign.property.property_number}-${curMonthStr}`,
              user_id: u.id,
              property_id: activeAssign.property.id,
              assignment_id: activeAssign.id,
              billing_month: curMonthStr,
              billing_year: curYear,
              rent_amount: rentAmt,
              gst_rate: gstRate,
              gst_amount: gstAmount,
              adjustment_amount: 0.0,
              total_amount_due: totalWithGst,
              amount_paid: 0.0,
              balance_due: totalWithGst,
              due_date: curDueDate,
              status: 'PENDING' as const,
            });
            unpaidSumByUser.set(u.id, totalWithGst);
          }
        }

        if (missingInitialBills.length > 0) {
          await rentalPrisma.rentalBill
            .createMany({ data: missingInitialBills, skipDuplicates: true })
            .catch(() => {});
        }

        const formatted = users.map((u) => {
          const activeAssignment = assignByUser.get(u.id);
          const outstandingBalance = unpaidSumByUser.get(u.id) || 0;

          return {
            id: u.id,
            userCode: u.user_id,
            fullName: u.full_name,
            mobile: u.mobile,
            email: u.email,
            profilePhotoUrl: u.profile_photo_url,
            permanentAddress: u.permanent_address,
            currentAddress: u.current_address,
            status: u.status,
            createdAt: u.created_at,
            assignedProperty: activeAssignment
              ? {
                  propertyId: activeAssignment.property.property_id,
                  propertyName: activeAssignment.property.property_name,
                  propertyNumber: activeAssignment.property.property_number,
                  location: activeAssignment.property.location,
                  address: activeAssignment.property.address,
                  monthlyRent: Number(activeAssignment.monthly_rent),
                }
              : null,
            outstandingBalance,
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
   * Get single tenant details with documents & assignment history (flattened parallel queries)
   */
  async getTenantDetails(userId: string) {
    return withRentalDbRetry(async () => {
      const [user, assignments, documents, rentChangeHistory, bills] = await Promise.all([
        rentalPrisma.rentalUser.findUnique({ where: { id: userId } }),
        rentalPrisma.propertyAssignment.findMany({
          where: { user_id: userId },
          include: { property: true },
          orderBy: { created_at: 'desc' },
        }),
        rentalPrisma.rentalUserDocument.findMany({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' },
        }),
        rentalPrisma.rentChangeHistory.findMany({
          where: { user_id: userId },
          include: { property: true },
          orderBy: { effective_date: 'desc' },
        }),
        rentalPrisma.rentalBill.findMany({
          where: { user_id: userId },
          orderBy: { created_at: 'desc' },
          take: 12,
        }),
      ]);

      if (!user) {
        throw new Error('Tenant record not found.');
      }

      const bucket = process.env.AWS_S3_BUCKET_NAME || 'zila-panchayat-images';
      let profilePhotoPresigned = user.profile_photo_url;
      if (user.profile_photo_key) {
        try {
          const photoCmd = new GetObjectCommand({
            Bucket: bucket,
            Key: user.profile_photo_key,
          });
          profilePhotoPresigned = await getSignedUrl(s3, photoCmd, { expiresIn: 3600 });
        } catch {
          // fallback to stored url
        }
      }

      const enrichedDocs = await Promise.all(
        documents.map(async (doc) => {
          let presignedUrl = doc.file_url;
          if (doc.s3_key) {
            try {
              const docCmd = new GetObjectCommand({
                Bucket: bucket,
                Key: doc.s3_key,
                ResponseContentDisposition: `inline; filename="${doc.file_name}"`,
              });
              presignedUrl = await getSignedUrl(s3, docCmd, { expiresIn: 3600 });
            } catch {
              // fallback to stored url
            }
          }
          return {
            ...doc,
            presigned_url: presignedUrl,
          };
        })
      );

      return {
        ...user,
        assignments,
        rentChangeHistory,
        bills,
        profile_photo_url: profilePhotoPresigned,
        documents: enrichedDocs,
      };
    });
  }

  /**
   * Admin: Update Tenant Profile (Every single field editable)
   */
  async updateTenantProfile(
    adminId: string,
    userId: string,
    dto: {
      fullName?: string;
      mobile?: string;
      email?: string;
      permanentAddress?: string;
      currentAddress?: string;
      aadhaarNumber?: string;
      panNumber?: string;
      gstNumber?: string;
      password?: string;
      propertyId?: string;
      monthlyRent?: number;
      allotmentDate?: string;
      leaseEndDate?: string;
    },
    files?: {
      profilePhoto?: { location: string; key: string; size: number; mimetype: string };
      aadhaarDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      panDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      domicileDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      gstDoc?: { location: string; key: string; size: number; mimetype: string; originalname: string };
      shopPhoto?: { location: string; key: string; size: number; mimetype: string; originalname: string };
    },
    clientIp?: string
  ) {
    return withRentalDbRetry(async () => {
      const existingUser = await rentalPrisma.rentalUser.findUnique({
        where: { id: userId },
        include: {
          assignments: {
            where: { is_active: true },
            include: { property: true },
          },
        },
      });

      if (!existingUser) {
        throw new Error('Tenant record not found.');
      }

      // 1. Mobile uniqueness check if changing
      if (dto.mobile && dto.mobile.trim() !== existingUser.mobile) {
        const duplicate = await rentalPrisma.rentalUser.findFirst({
          where: { mobile: dto.mobile.trim(), id: { not: userId } },
        });
        if (duplicate) {
          throw new Error(`Mobile number ${dto.mobile} is already registered to another tenant.`);
        }
      }

      // 2. Prepare Masked Aadhaar / PAN if changed
      let aadhaarMasked = existingUser.aadhaar_masked;
      if (dto.aadhaarNumber && dto.aadhaarNumber.trim()) {
        const raw = dto.aadhaarNumber.replace(/\D/g, '');
        if (raw.length === 12) {
          aadhaarMasked = `XXXX-XXXX-${raw.slice(8)}`;
        }
      }

      let panMasked = existingUser.pan_masked;
      if (dto.panNumber && dto.panNumber.trim()) {
        const raw = dto.panNumber.trim().toUpperCase();
        if (raw.length === 10) {
          panMasked = `XXXXX${raw.slice(5)}`;
        }
      }

      // 3. Password reset if requested
      let passwordHash: string | undefined = undefined;
      if (dto.password && dto.password.trim().length >= 6) {
        const salt = await bcrypt.genSalt(12);
        passwordHash = await bcrypt.hash(dto.password.trim(), salt);
      }

      // 4. Atomic transaction
      const updatedUser = await rentalPrisma.$transaction(async (tx) => {
        // Update user base fields
        const user = await tx.rentalUser.update({
          where: { id: userId },
          data: {
            full_name: dto.fullName?.trim() || existingUser.full_name,
            mobile: dto.mobile?.trim() || existingUser.mobile,
            email: dto.email !== undefined ? (dto.email.trim() || null) : existingUser.email,
            permanent_address: dto.permanentAddress?.trim() || existingUser.permanent_address,
            current_address: dto.currentAddress !== undefined ? (dto.currentAddress.trim() || null) : existingUser.current_address,
            aadhaar_masked: aadhaarMasked,
            pan_masked: panMasked,
            gst_number: dto.gstNumber !== undefined ? (dto.gstNumber.trim().toUpperCase() || null) : existingUser.gst_number,
            ...(passwordHash ? { passwordHash } : {}),
            ...(files?.profilePhoto ? {
              profile_photo_url: files.profilePhoto.location,
              profile_photo_key: files.profilePhoto.key,
            } : {}),
          },
        });

        // Save new documents if uploaded
        const docsToCreate = [];
        if (files?.aadhaarDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'AADHAAR' as const,
            file_url: files.aadhaarDoc.location,
            s3_key: files.aadhaarDoc.key,
            file_name: files.aadhaarDoc.originalname || 'Aadhaar_Card.webp',
            file_size: files.aadhaarDoc.size,
            mime_type: files.aadhaarDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files?.panDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'PAN' as const,
            file_url: files.panDoc.location,
            s3_key: files.panDoc.key,
            file_name: files.panDoc.originalname || 'PAN_Card.webp',
            file_size: files.panDoc.size,
            mime_type: files.panDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files?.domicileDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'DOMICILE' as const,
            file_url: files.domicileDoc.location,
            s3_key: files.domicileDoc.key,
            file_name: files.domicileDoc.originalname || 'Domicile_Certificate.webp',
            file_size: files.domicileDoc.size,
            mime_type: files.domicileDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files?.gstDoc) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'GST' as const,
            file_url: files.gstDoc.location,
            s3_key: files.gstDoc.key,
            file_name: files.gstDoc.originalname || 'GST_Certificate.webp',
            file_size: files.gstDoc.size,
            mime_type: files.gstDoc.mimetype,
            verification_status: 'PENDING' as const,
          });
        }
        if (files?.shopPhoto) {
          docsToCreate.push({
            user_id: user.id,
            doc_type: 'OTHER' as const,
            file_url: files.shopPhoto.location,
            s3_key: files.shopPhoto.key,
            file_name: files.shopPhoto.originalname || 'Shop_Photo.webp',
            file_size: files.shopPhoto.size,
            mime_type: files.shopPhoto.mimetype,
            verification_status: 'PENDING' as const,
          });
        }

        if (docsToCreate.length > 0) {
          await tx.rentalUserDocument.createMany({
            data: docsToCreate,
          });
        }

        // Handle Property, Allotment Dates & Rent changes
        const currentActiveAssignment = existingUser.assignments[0];

        const parsedAllotmentDate =
          dto.allotmentDate && dto.allotmentDate.trim() ? new Date(dto.allotmentDate.trim()) : undefined;
        const hasValidAllotmentDate = parsedAllotmentDate && !isNaN(parsedAllotmentDate.getTime());

        let parsedLeaseEndDate: Date | null | undefined = undefined;
        if (dto.leaseEndDate !== undefined) {
          if (dto.leaseEndDate.trim() === '') {
            parsedLeaseEndDate = null;
          } else {
            const dt = new Date(dto.leaseEndDate.trim());
            if (!isNaN(dt.getTime())) parsedLeaseEndDate = dt;
          }
        }

        const effectiveStartForValidation = hasValidAllotmentDate
          ? parsedAllotmentDate
          : currentActiveAssignment?.allotment_date || currentActiveAssignment?.lease_start_date;

        if (
          parsedLeaseEndDate &&
          effectiveStartForValidation &&
          parsedLeaseEndDate < new Date(effectiveStartForValidation)
        ) {
          throw new Error('दुकान आवंटन समाप्ति तिथि, आवंटन तिथि से पहले नहीं हो सकती। (Allotment end date cannot be before allotment date.)');
        }

        if (dto.propertyId) {
          const targetProperty = await tx.rentalProperty.findFirst({
            where: {
              OR: [
                { id: dto.propertyId },
                { property_id: dto.propertyId },
                { property_number: dto.propertyId },
              ],
            },
          });

          if (!targetProperty) {
            throw new Error('Specified property / shop does not exist.');
          }

          const rentAmount = dto.monthlyRent !== undefined && Number(dto.monthlyRent) > 0
            ? Number(dto.monthlyRent)
            : (currentActiveAssignment ? Number(currentActiveAssignment.monthly_rent) : Number(targetProperty.base_monthly_rent));

          if (currentActiveAssignment) {
            if (currentActiveAssignment.property_id === targetProperty.id) {
              // Same property: check rent & allotment dates changes
              const assignmentUpdateData: any = {};
              if (Number(currentActiveAssignment.monthly_rent) !== rentAmount) {
                assignmentUpdateData.monthly_rent = rentAmount;
              }
              if (hasValidAllotmentDate) {
                assignmentUpdateData.allotment_date = parsedAllotmentDate;
                assignmentUpdateData.lease_start_date = parsedAllotmentDate;
              }
              if (parsedLeaseEndDate !== undefined) {
                assignmentUpdateData.lease_end_date = parsedLeaseEndDate;
              }

              if (Object.keys(assignmentUpdateData).length > 0) {
                await tx.propertyAssignment.update({
                  where: { id: currentActiveAssignment.id },
                  data: assignmentUpdateData,
                });
              }

              if (Number(currentActiveAssignment.monthly_rent) !== rentAmount) {
                await tx.rentChangeHistory.create({
                  data: {
                    user_id: userId,
                    property_id: targetProperty.id,
                    previous_rent: currentActiveAssignment.monthly_rent,
                    new_rent: rentAmount,
                    effective_date: new Date(),
                    reason: 'Admin adjusted monthly rent in profile update',
                    approved_by: adminId,
                  },
                });
              }
            } else {
              // Re-assigning to a different property!
              if (targetProperty.status === 'ALLOTTED') {
                throw new Error(`Shop ${targetProperty.property_number} is already allotted to another tenant.`);
              }
              // Deactivate old assignment
              await tx.propertyAssignment.update({
                where: { id: currentActiveAssignment.id },
                data: {
                  is_active: false,
                  deactivated_at: new Date(),
                  deactivation_reason: 'Admin reassigned tenant to another shop',
                },
              });
              // Mark old property VACANT
              await tx.rentalProperty.update({
                where: { id: currentActiveAssignment.property_id },
                data: { status: 'VACANT' },
              });
              // Create new assignment
              const newStart = hasValidAllotmentDate ? parsedAllotmentDate : new Date();
              await tx.propertyAssignment.create({
                data: {
                  property_id: targetProperty.id,
                  user_id: userId,
                  monthly_rent: rentAmount,
                  allotment_date: newStart,
                  lease_start_date: newStart,
                  lease_end_date: parsedLeaseEndDate ?? null,
                  is_active: true,
                  assigned_by: adminId,
                },
              });
              // Mark new property ALLOTTED
              await tx.rentalProperty.update({
                where: { id: targetProperty.id },
                data: { status: 'ALLOTTED' },
              });
            }
          } else {
            // First time assignment
            if (targetProperty.status === 'ALLOTTED') {
              throw new Error(`Shop ${targetProperty.property_number} is already allotted to another tenant.`);
            }
            const firstStart = hasValidAllotmentDate ? parsedAllotmentDate : new Date();
            await tx.propertyAssignment.create({
              data: {
                property_id: targetProperty.id,
                user_id: userId,
                monthly_rent: rentAmount,
                allotment_date: firstStart,
                lease_start_date: firstStart,
                lease_end_date: parsedLeaseEndDate ?? null,
                is_active: true,
                assigned_by: adminId,
              },
            });
            await tx.rentalProperty.update({
              where: { id: targetProperty.id },
              data: { status: 'ALLOTTED' },
            });
          }
        } else if (currentActiveAssignment) {
          // Property didn't change, update monthly rent and/or allotment dates if provided
          const assignmentUpdateData: any = {};
          if (dto.monthlyRent !== undefined && Number(dto.monthlyRent) > 0 && Number(currentActiveAssignment.monthly_rent) !== Number(dto.monthlyRent)) {
            assignmentUpdateData.monthly_rent = Number(dto.monthlyRent);
          }
          if (hasValidAllotmentDate) {
            assignmentUpdateData.allotment_date = parsedAllotmentDate;
            assignmentUpdateData.lease_start_date = parsedAllotmentDate;
          }
          if (parsedLeaseEndDate !== undefined) {
            assignmentUpdateData.lease_end_date = parsedLeaseEndDate;
          }

          if (Object.keys(assignmentUpdateData).length > 0) {
            await tx.propertyAssignment.update({
              where: { id: currentActiveAssignment.id },
              data: assignmentUpdateData,
            });
          }

          if (dto.monthlyRent !== undefined && Number(dto.monthlyRent) > 0 && Number(currentActiveAssignment.monthly_rent) !== Number(dto.monthlyRent)) {
            await tx.rentChangeHistory.create({
              data: {
                user_id: userId,
                property_id: currentActiveAssignment.property_id,
                previous_rent: currentActiveAssignment.monthly_rent,
                new_rent: Number(dto.monthlyRent),
                effective_date: new Date(),
                reason: 'Admin adjusted monthly rent',
                approved_by: adminId,
              },
            });
          }
        }

        // Administrative Audit Trail
        await tx.rentalAdminAuditLog.create({
          data: {
            admin_id: adminId,
            action: 'TENANT_PROFILE_UPDATED',
            target_entity: 'RentalUser',
            target_id: userId,
            before_state: JSON.stringify({
              fullName: existingUser.full_name,
              mobile: existingUser.mobile,
              status: existingUser.status,
            }),
            after_state: JSON.stringify(dto),
            ip_address: clientIp || 'Unknown',
          },
        });

        return user;
      });

      rentalCache.invalidate('tenants:', 'overview:', 'analytics:', 'properties:', 'ledger:');
      return updatedUser;
    });
  }

  /**
   * Generate Pre-signed S3 Expiring Download URL for Identity Documents (15 mins validity).
   * Verified with Object-Level Authorization: Only owning tenant or authorized administrator can generate.
   */
  async getSecureDocumentUrl(docId: string, requestingUserId?: string, isAdmin = false) {
    return withRentalDbRetry(async () => {
      const doc = await rentalPrisma.rentalUserDocument.findUnique({
        where: { id: docId },
      });

      if (!doc) {
        throw new Error('Document record not found.');
      }

      // Enforce object-level ownership if requested by a tenant
      if (!isAdmin && requestingUserId && doc.user_id !== requestingUserId) {
        throw new Error('Unauthorized: You do not own this document.');
      }

      const bucket = process.env.AWS_S3_BUCKET_NAME || 'zila-panchayat-images';

      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: doc.s3_key,
        ResponseContentDisposition: `inline; filename="${doc.file_name}"`,
      });

      // Expiring URL valid for 15 minutes (900 seconds)
      const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

      return {
        docId: doc.id,
        docType: doc.doc_type,
        fileName: doc.file_name,
        presignedUrl,
        expiresInSeconds: 900,
      };
    });
  }

  /**
   * Permanently delete a tenant from Database A, reset assigned property to VACANT,
   * and delete all associated S3 files (profile image, KYC docs, and shop photo).
   */
  async deleteTenant(tenantId: string, adminId: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const user = await rentalPrisma.rentalUser.findUnique({
        where: { id: tenantId },
        include: {
          assignments: {
            where: { is_active: true },
          },
          documents: {
            select: {
              s3_key: true,
              file_url: true,
            },
          },
          receipts: {
            select: {
              receipt_pdf_url: true,
            },
          },
        },
      });

      if (!user) {
        throw new Error('किरायेदार रिकॉर्ड नहीं मिला (Tenant not found).');
      }

      // Collect all S3 keys (profile photo, KYC documents, shop photo, receipt PDFs) prior to DB removal
      const s3KeysToDelete: string[] = [];
      const profileKey = extractS3Key(user.profile_photo_key, user.profile_photo_url);
      if (profileKey) s3KeysToDelete.push(profileKey);

      for (const doc of user.documents) {
        const docKey = extractS3Key(doc.s3_key, doc.file_url);
        if (docKey) s3KeysToDelete.push(docKey);
      }

      for (const rec of user.receipts) {
        const recKey = extractS3Key(null, rec.receipt_pdf_url);
        if (recKey) s3KeysToDelete.push(recKey);
      }

      await rentalPrisma.$transaction(
        async (tx) => {
          // Stage 1: Reset active properties & delete deepest child tables concurrently
          await Promise.all([
            ...user.assignments.map((assign) =>
              tx.rentalProperty.update({
                where: { id: assign.property_id },
                data: { status: 'VACANT' },
              })
            ),
            tx.rentalReceipt.deleteMany({ where: { user_id: tenantId } }),
            tx.paymentAuditTrail.deleteMany({ where: { user_id: tenantId } }),
            tx.rentalLedgerEntry.deleteMany({ where: { user_id: tenantId } }),
            tx.rentalUserDocument.deleteMany({ where: { user_id: tenantId } }),
            tx.rentalNotice.deleteMany({ where: { recipient_user_id: tenantId } }),
            tx.rentChangeHistory.deleteMany({ where: { user_id: tenantId } }),
          ]);

          // Stage 2: Delete payments & bills concurrently (after receipts/ledger/audit links are gone)
          await Promise.all([
            tx.rentalPayment.deleteMany({ where: { user_id: tenantId } }),
            tx.rentalBill.deleteMany({ where: { user_id: tenantId } }),
          ]);

          // Stage 3: Delete assignments, then tenant user + admin audit log
          await tx.propertyAssignment.deleteMany({ where: { user_id: tenantId } });

          await Promise.all([
            tx.rentalUser.delete({
              where: { id: tenantId },
            }),
            tx.rentalAdminAuditLog.create({
              data: {
                admin_id: adminId,
                action: 'TENANT_DELETED',
                target_entity: 'RentalUser',
                target_id: tenantId,
                reason: `Admin deleted tenant ${user.full_name} (${user.user_id})`,
                before_state: JSON.stringify({
                  userId: user.user_id,
                  name: user.full_name,
                  mobile: user.mobile,
                  s3ObjectsQueuedForDeletion: s3KeysToDelete.length,
                }),
                ip_address: clientIp || null,
              },
            }),
          ]);
        },
        { maxWait: 10000, timeout: 30000 }
      );

      // Clean up all tenant S3 files after DB commit so failed transactions never orphan live records
      const s3DeletedCount = await deleteS3Objects(s3KeysToDelete);
      rentalCache.invalidate('tenants:', 'overview:', 'analytics:', 'properties:', 'ledger:', 'notices:', 'audit:');

      return {
        success: true,
        s3DeletedCount,
        message: `Tenant ${user.full_name} (${user.user_id}) and ${s3DeletedCount} S3 file(s) deleted successfully.`,
      };
    });
  }
}

export const rentalUserService = new RentalUserService();
