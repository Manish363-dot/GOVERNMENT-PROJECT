import bcrypt from 'bcryptjs';
import { rentalPrisma, withRentalDbRetry } from '../../../shared/config/rentalPrisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

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
        const leaseStart = dto.rentEffectiveDate ? new Date(dto.rentEffectiveDate) : new Date();

        const createdAssignment = await tx.propertyAssignment.create({
          data: {
            property_id: property.id,
            user_id: user.id,
            monthly_rent: rent,
            lease_start_date: leaseStart,
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

        const initialBill = await tx.rentalBill.create({
          data: {
            bill_number: billNumber,
            user_id: user.id,
            property_id: property.id,
            assignment_id: createdAssignment.id,
            billing_month: billingMonthStr,
            billing_year: billYear,
            rent_amount: rent,
            adjustment_amount: 0.0,
            total_amount_due: rent,
            amount_paid: 0.0,
            balance_due: rent,
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
            debit: rent,
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
   * Search and list tenants with pagination and filters
   */
  async listTenants(params: {
    search?: string;
    status?: string;
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
            assignments: {
              where: { is_active: true },
              select: {
                id: true,
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
            },
            bills: {
              select: { id: true, status: true, balance_due: true },
            },
          },
          orderBy: { created_at: 'desc' },
          skip,
          take: limit,
        }),
      ]);

      // Auto-provision initial PENDING bill for any active tenant who has 0 bills in DB
      const now = new Date();
      const curYear = now.getFullYear();
      const curMonthNum = now.getMonth() + 1;
      const curMonthStr = `${curYear}-${String(curMonthNum).padStart(2, '0')}`;
      const curDueDate = new Date(curYear, curMonthNum - 1, 20, 23, 59, 59);

      for (const u of users) {
        const activeAssign = u.assignments[0];
        if (activeAssign && u.bills.length === 0) {
          const rentAmt = Number(activeAssign.monthly_rent);
          const autoBillNo = `BL-${activeAssign.property.property_number}-${curMonthStr}`;
          try {
            const createdBill = await rentalPrisma.rentalBill.create({
              data: {
                bill_number: autoBillNo,
                user_id: u.id,
                property_id: activeAssign.property.id,
                assignment_id: activeAssign.id,
                billing_month: curMonthStr,
                billing_year: curYear,
                rent_amount: rentAmt,
                adjustment_amount: 0.0,
                total_amount_due: rentAmt,
                amount_paid: 0.0,
                balance_due: rentAmt,
                due_date: curDueDate,
                status: 'PENDING',
              },
            });
            u.bills.push({
              id: createdBill.id,
              status: 'PENDING',
              balance_due: createdBill.balance_due,
            });
          } catch {
            // Ignore duplicate collision if concurrently created
          }
        }
      }

      const formatted = users.map((u) => {
        const activeAssignment = u.assignments[0];
        const unpaidBills = u.bills.filter((b) =>
          ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'].includes(b.status)
        );
        const outstandingBalance =
          u.bills.length === 0 && activeAssignment
            ? Number(activeAssignment.monthly_rent)
            : unpaidBills.reduce((sum, b) => sum + Number(b.balance_due), 0);

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
    });
  }

  /**
   * Get single tenant details with documents & assignment history
   */
  async getTenantDetails(userId: string) {
    return withRentalDbRetry(async () => {
      const user = await rentalPrisma.rentalUser.findUnique({
        where: { id: userId },
        include: {
          assignments: {
            include: { property: true },
            orderBy: { created_at: 'desc' },
          },
          documents: {
            orderBy: { created_at: 'desc' },
          },
          rentChangeHistory: {
            include: { property: true },
            orderBy: { effective_date: 'desc' },
          },
          bills: {
            orderBy: { created_at: 'desc' },
            take: 12,
          },
        },
      });

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
        user.documents.map(async (doc) => {
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
        profile_photo_url: profilePhotoPresigned,
        documents: enrichedDocs,
      };
    });
  }

  /**
   * Update Tenant Account Status (ACTIVE, INACTIVE, SUSPENDED)
   */
  async updateTenantStatus(adminId: string, userId: string, status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED', reason?: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const user = await rentalPrisma.rentalUser.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('Tenant record not found.');
      }

      const updated = await rentalPrisma.rentalUser.update({
        where: { id: userId },
        data: {
          status,
          deactivation_reason: reason || null,
        },
      });

      await rentalPrisma.rentalAdminAuditLog.create({
        data: {
          admin_id: adminId,
          action: 'TENANT_STATUS_UPDATED',
          target_entity: 'RentalUser',
          target_id: userId,
          reason: reason || undefined,
          before_state: JSON.stringify({ status: user.status }),
          after_state: JSON.stringify({ status }),
          ip_address: clientIp || 'Unknown',
        },
      });

      return updated;
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
      status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
      password?: string;
      propertyId?: string;
      monthlyRent?: number;
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
            status: (dto.status as any) || existingUser.status,
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

        if (docsToCreate.length > 0) {
          await tx.rentalUserDocument.createMany({
            data: docsToCreate,
          });
        }

        // Handle Property & Rent changes
        const currentActiveAssignment = existingUser.assignments[0];
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
              // Same property, check if rent changed
              if (Number(currentActiveAssignment.monthly_rent) !== rentAmount) {
                await tx.propertyAssignment.update({
                  where: { id: currentActiveAssignment.id },
                  data: { monthly_rent: rentAmount },
                });
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
              await tx.propertyAssignment.create({
                data: {
                  property_id: targetProperty.id,
                  user_id: userId,
                  monthly_rent: rentAmount,
                  lease_start_date: new Date(),
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
            await tx.propertyAssignment.create({
              data: {
                property_id: targetProperty.id,
                user_id: userId,
                monthly_rent: rentAmount,
                lease_start_date: new Date(),
                is_active: true,
                assigned_by: adminId,
              },
            });
            await tx.rentalProperty.update({
              where: { id: targetProperty.id },
              data: { status: 'ALLOTTED' },
            });
          }
        } else if (dto.monthlyRent !== undefined && currentActiveAssignment && Number(dto.monthlyRent) > 0) {
          // Property didn't change, only monthly rent updated
          if (Number(currentActiveAssignment.monthly_rent) !== Number(dto.monthlyRent)) {
            await tx.propertyAssignment.update({
              where: { id: currentActiveAssignment.id },
              data: { monthly_rent: Number(dto.monthlyRent) },
            });
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
   * Permanently delete a tenant from Database A and reset assigned property to VACANT
   */
  async deleteTenant(tenantId: string, adminId: string, clientIp?: string) {
    return withRentalDbRetry(async () => {
      const user = await rentalPrisma.rentalUser.findUnique({
        where: { id: tenantId },
        include: {
          assignments: {
            where: { is_active: true },
          },
        },
      });

      if (!user) {
        throw new Error('किरायेदार रिकॉर्ड नहीं मिला (Tenant not found).');
      }

      await rentalPrisma.$transaction(async (tx) => {
        // 1. Reset any active allotted properties to VACANT
        for (const assign of user.assignments) {
          await tx.rentalProperty.update({
            where: { id: assign.property_id },
            data: { status: 'VACANT' },
          });
        }

        // 2. Delete related child records in order
        await tx.rentalReceipt.deleteMany({ where: { user_id: tenantId } });
        await tx.rentalPayment.deleteMany({ where: { user_id: tenantId } });
        await tx.rentalLedgerEntry.deleteMany({ where: { user_id: tenantId } });
        await tx.rentalBill.deleteMany({ where: { user_id: tenantId } });
        await tx.rentChangeHistory.deleteMany({ where: { user_id: tenantId } });
        await tx.propertyAssignment.deleteMany({ where: { user_id: tenantId } });
        await tx.rentalUserDocument.deleteMany({ where: { user_id: tenantId } });
        await tx.paymentAuditTrail.deleteMany({ where: { user_id: tenantId } });
        await tx.rentalNotice.deleteMany({ where: { recipient_user_id: tenantId } });

        // 3. Delete the tenant user record
        await tx.rentalUser.delete({
          where: { id: tenantId },
        });

        // 4. Audit Log
        await tx.rentalAdminAuditLog.create({
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
            }),
            ip_address: clientIp || null,
          },
        });
      });

      return {
        success: true,
        message: `Tenant ${user.full_name} (${user.user_id}) deleted successfully.`,
      };
    });
  }
}

export const rentalUserService = new RentalUserService();
