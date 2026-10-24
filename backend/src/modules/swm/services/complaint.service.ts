import { prisma } from '../../../shared/config/prisma';
import { Complaint } from '@prisma/client';
import crypto from 'crypto';
import * as whatsappService from '../../../shared/notifications/whatsapp.service';

export function isValidRealWorldMobile(mobile: string): { valid: boolean; reason?: string } {
  const clean = mobile.replace(/\D/g, '');

  if (clean.length !== 10) {
    return { valid: false, reason: 'Mobile number must be exactly 10 digits.' };
  }

  if (!/^[6-9]/.test(clean)) {
    return { valid: false, reason: 'Indian mobile numbers must start with 6, 7, 8, or 9.' };
  }

  // Reject all identical digits (e.g., 9999999999, 8888888888, 7777777777)
  if (/^(\d)\1{9}$/.test(clean)) {
    return { valid: false, reason: 'Invalid mobile number. All identical digits are not allowed.' };
  }

  // Common fake/dummy test patterns
  const invalidDummies = [
    '1234567890',
    '0123456789',
    '9876543210',
    '8765432109',
    '7654321098',
  ];

  if (invalidDummies.includes(clean)) {
    return { valid: false, reason: 'Dummy or test numbers (e.g. 1234567890, 9876543210) are invalid.' };
  }

  return { valid: true };
}

// Memory map for active complaint OTPs
const complaintOtpMap = new Map<string, { otp: string; expiresAt: number; attempts: number; verified?: boolean }>();

export async function sendComplaintOtp(mobile: string) {
  const check = isValidRealWorldMobile(mobile);
  if (!check.valid) {
    throw new Error(check.reason || 'Invalid mobile number');
  }

  const cleanMobile = mobile.replace(/\D/g, '');
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  complaintOtpMap.set(cleanMobile, {
    otp,
    expiresAt,
    attempts: 0,
    verified: false,
  });

  // Dispatch OTP to Citizen via WhatsApp Cloud API
  const waResult = await whatsappService.sendWhatsAppOtp(cleanMobile, otp);

  return {
    success: true,
    message: waResult.success 
      ? `सत्यापन कोड (OTP) आपके WhatsApp नंबर +91 ${cleanMobile} पर भेज दिया गया है।`
      : `सत्यापन कोड (OTP) उत्पन्न किया गया (+91 ${cleanMobile})`,
    whatsappSent: waResult.success,
    devOtp: waResult.success ? undefined : otp, // Only fallback on screen if WhatsApp delivery was not successful
  };
}

export async function verifyComplaintOtp(mobile: string, otp: string) {
  const cleanMobile = mobile.replace(/\D/g, '');
  const record = complaintOtpMap.get(cleanMobile);

  if (!record) {
    throw new Error('कोई सक्रिय OTP नहीं मिला। कृपया पुनः OTP भेजें (No active OTP found. Please request a new one).');
  }

  if (Date.now() > record.expiresAt) {
    complaintOtpMap.delete(cleanMobile);
    throw new Error('OTP की समय सीमा समाप्त हो गई है (OTP has expired. Please request a new code).');
  }

  if (record.attempts >= 5) {
    complaintOtpMap.delete(cleanMobile);
    throw new Error('अत्यधिक गलत प्रयास। कृपया 5 मिनट बाद नया OTP प्राप्त करें (Too many attempts).');
  }

  if (record.otp.trim() !== otp.trim()) {
    record.attempts += 1;
    throw new Error(`गलत OTP दर्ज किया गया है (${5 - record.attempts} प्रयास शेष)।`);
  }

  // Mark as verified for this mobile session
  record.verified = true;

  return {
    success: true,
    message: 'मोबाइल नंबर WhatsApp द्वारा सफलतापूर्वक सत्यापित किया गया (Mobile verified successfully).',
  };
}
export async function createComplaint(complaint: {
  name: string;
  mobile: string;
  area: string;
  complaint_type: string;
  description?: string;
  attachment_url?: string | null;
}) {
  const check = isValidRealWorldMobile(complaint.mobile);
  if (!check.valid) {
    throw new Error(check.reason || 'Invalid mobile number');
  }

  const cleanMobile = complaint.mobile.replace(/\D/g, '');

  try {
    // MED-10: Sanitize text inputs (strip HTML tags)
    const sanitize = (str: string) => str.replace(/<[^>]*>/g, '').trim();

    // MED-6: Use crypto UUID for guaranteed uniqueness
    const complaintNumber = `COMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

    const newComplaint = await prisma.complaint.create({
      data: {
        name: sanitize(complaint.name),
        mobile: cleanMobile,
        area: sanitize(complaint.area),
        complaint_number: complaintNumber,
        complaint_type: complaint.complaint_type as any,
        description: complaint.description ? sanitize(complaint.description) : null,
        attachment_url: complaint.attachment_url ? sanitize(complaint.attachment_url) : null,
        status: 'new' as any
      } as any
    });

    // Asynchronously send WhatsApp confirmation receipt to citizen
    whatsappService.sendWhatsAppComplaintReceipt(cleanMobile, {
      complaintNumber: newComplaint.complaint_number,
      citizenName: newComplaint.name,
      area: newComplaint.area,
      complaintType: newComplaint.complaint_type,
    }).catch((err) => {
      console.warn('⚠️ [WhatsApp] Failed to dispatch complaint receipt:', err.message);
    });

    return newComplaint;
  } catch (error) {
    throw new Error('Failed to register complaint');
  }
}

export async function getAllComplaints(status?: string) {
  try {
    let sql = `SELECT * FROM "Complaint" WHERE "is_archived" = false`;
    const params: any[] = [];

    if (status === 'archived') {
      sql = `SELECT * FROM "Complaint" WHERE "is_archived" = true`;
    } else if (status === 'confirmed') {
      sql = `SELECT * FROM "Complaint" WHERE "is_archived" = false AND "user_confirmed" = true`;
    } else if (status && status !== 'all') {
      sql = `SELECT * FROM "Complaint" WHERE "is_archived" = false AND "status"::text = $1`;
      params.push(status);
    }

    sql += ` ORDER BY "created_at" DESC`;

    return await prisma.$queryRawUnsafe<any[]>(sql, ...params);
  } catch (error: any) {
    console.error('getAllComplaints error:', error);
    require('fs').writeFileSync('getAllComplaints-error.log', String(error) + '\n' + error.stack);
    throw new Error('Failed to fetch complaints');
  }
}

export async function getComplaintById(id: string) {
  try {
    const list = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "Complaint" WHERE "id" = $1 LIMIT 1
    `, id);

    if (!list || list.length === 0) return null;
    const complaint = list[0];

    const updates = await prisma.complaintUpdate.findMany({
      where: { complaint_id: id },
      orderBy: { updated_at: 'desc' }
    });

    return { complaint, updates };
  } catch (error) {
    return null;
  }
}

export async function trackComplaint(trackingId: string) {
  try {
    const cleanQuery = trackingId.trim();
    const list = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "Complaint"
      WHERE UPPER("complaint_number") = UPPER($1) OR "mobile" = $1
      ORDER BY "created_at" DESC
      LIMIT 1
    `, cleanQuery);

    if (!list || list.length === 0) return null;
    const complaint = list[0];

    const updates = await prisma.complaintUpdate.findMany({
      where: { complaint_id: complaint.id },
      orderBy: { updated_at: 'desc' }
    });

    return { complaint, updates };
  } catch (error) {
    return null;
  }
}

export async function confirmComplaintResolution(identifier: string) {
  try {
    const cleanId = identifier.trim();
    const existingList = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "Complaint"
      WHERE "id" = $1 OR UPPER("complaint_number") = UPPER($1)
      LIMIT 1
    `, cleanId);

    const existing = existingList[0];
    if (!existing) {
      throw new Error('Complaint not found');
    }

    if (existing.status !== 'resolved') {
      throw new Error('Only complaints marked as RESOLVED by administration can be confirmed by citizens.');
    }

    const updatedList = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE "Complaint"
      SET "user_confirmed" = true, "user_confirmed_at" = NOW()
      WHERE "id" = $1
      RETURNING *
    `, existing.id);

    await prisma.complaintUpdate.create({
      data: {
        complaint_id: existing.id,
        status: 'resolved' as any,
        remark: 'नागरिक द्वारा समाधान की पुष्टि की गई (Citizen Confirmed Resolution)',
        updated_by: null
      }
    });

    return updatedList[0];
  } catch (err: any) {
    throw new Error(err.message || 'Failed to confirm resolution');
  }
}

export async function updateComplaintStatus(
  complaintId: string,
  status: string,
  remark: string | null,
  updatedBy: string
) {
  try {
    const statusRank: Record<string, number> = {
      new: 1,
      in_progress: 2,
      resolved: 3
    };

    const existingList = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM "Complaint" WHERE "id" = $1 LIMIT 1
    `, complaintId);

    const existing = existingList[0];
    if (!existing) {
      throw new Error('Complaint not found');
    }

    if (existing.status === 'resolved') {
      throw new Error('Complaint is already RESOLVED and locked. Resolved complaints cannot be modified or reverted.');
    }

    const currentRank = statusRank[existing.status] || 1;
    const targetRank = statusRank[status] || 1;

    if (targetRank <= currentRank) {
      throw new Error(`Cannot revert complaint status from '${existing.status}' back to '${status}'. Status can only progress forward (New → In Progress → Resolved).`);
    }

    const updatedList = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE "Complaint"
      SET "status" = $1::"ComplaintStatus"
      WHERE "id" = $2
      RETURNING *
    `, status, complaintId);

    await prisma.complaintUpdate.create({
      data: {
        complaint_id: complaintId,
        status: status as any,
        remark,
        updated_by: updatedBy
      }
    });

    const updatedComplaint = updatedList[0];

    // Asynchronously send WhatsApp status update alert to citizen
    whatsappService.sendWhatsAppStatusUpdate(existing.mobile, {
      complaintNumber: existing.complaint_number,
      citizenName: existing.name,
      newStatus: status as any,
      remark,
    }).catch((err) => {
      console.warn('⚠️ [WhatsApp] Failed to dispatch status update notification:', err.message);
    });

    return updatedComplaint;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update complaint');
  }
}

export async function archiveComplaint(id: string, isArchived: boolean = true) {
  try {
    const updatedList = await prisma.$queryRawUnsafe<any[]>(`
      UPDATE "Complaint"
      SET "is_archived" = $1, "archived_at" = (CASE WHEN $1 THEN NOW() ELSE NULL END)
      WHERE "id" = $2
      RETURNING *
    `, isArchived, id);

    const updated = updatedList[0];

    await prisma.complaintUpdate.create({
      data: {
        complaint_id: id,
        status: updated.status as any,
        remark: isArchived 
          ? 'शिकायत को सुरक्षित अभिलेख हेतु आर्काइव किया गया (Complaint Safely Archived)' 
          : 'शिकायत को सक्रिय रजिस्टर में पुनर्स्थापित किया गया (Complaint Restored)',
        updated_by: null
      }
    });

    return updated;
  } catch (error: any) {
    throw new Error('Failed to archive complaint');
  }
}

export async function deleteComplaint(id: string) {
  try {
    await prisma.$queryRawUnsafe(`
      DELETE FROM "ComplaintUpdate" WHERE "complaint_id" = $1
    `, id);
    await prisma.$queryRawUnsafe(`
      DELETE FROM "Complaint" WHERE "id" = $1
    `, id);
    return { success: true };
  } catch (error: any) {
    throw new Error('Failed to delete complaint');
  }
}

export async function getComplaintCounts() {
  try {
    const activeCounts = await prisma.$queryRawUnsafe<any[]>(`
      SELECT "status"::text AS status, COUNT(*)::int AS count
      FROM "Complaint"
      WHERE "is_archived" = false
      GROUP BY "status"
    `);

    let total = 0, newC = 0, in_progress = 0, resolved = 0;
    for (const c of activeCounts) {
      total += Number(c.count);
      if (c.status === 'new') newC = Number(c.count);
      if (c.status === 'in_progress') in_progress = Number(c.count);
      if (c.status === 'resolved') resolved = Number(c.count);
    }

    const confirmedRes = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*)::int AS count 
      FROM "Complaint" 
      WHERE "user_confirmed" = true AND "is_archived" = false
    `);
    const confirmedCount = Number(confirmedRes[0]?.count || 0);

    const archivedRes = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*)::int AS count 
      FROM "Complaint" 
      WHERE "is_archived" = true
    `);
    const archivedCount = Number(archivedRes[0]?.count || 0);

    return { 
      total, 
      new: newC, 
      in_progress, 
      resolved, 
      confirmed: confirmedCount,
      archived: archivedCount 
    };
  } catch (error) {
    return { total: 0, new: 0, in_progress: 0, resolved: 0, confirmed: 0, archived: 0 };
  }
}

export async function getNewComplaintCount(): Promise<number> {
  try {
    const res = await prisma.$queryRawUnsafe<any[]>(`
      SELECT COUNT(*)::int AS count 
      FROM "Complaint" 
      WHERE "status"::text = 'new' AND "is_archived" = false
    `);
    return Number(res[0]?.count || 0);
  } catch (error) {
    return 0;
  }
}


