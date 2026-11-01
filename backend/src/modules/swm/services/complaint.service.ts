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
    const where: any = {};
    if (status === 'archived') {
      where.is_archived = true;
    } else if (status === 'confirmed') {
      where.is_archived = false;
      where.user_confirmed = true;
    } else if (status && status !== 'all') {
      where.is_archived = false;
      where.status = status;
    } else {
      where.is_archived = false;
    }

    return await prisma.complaint.findMany({
      where,
      orderBy: { created_at: 'desc' }
    });
  } catch (error: any) {
    console.error('getAllComplaints error:', error);
    throw new Error('Failed to fetch complaints');
  }
}

export async function getComplaintById(id: string) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id }
    });

    if (!complaint) return null;

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
    const complaint = await prisma.complaint.findFirst({
      where: {
        OR: [
          { complaint_number: { equals: cleanQuery, mode: 'insensitive' } },
          { mobile: cleanQuery }
        ]
      },
      orderBy: { created_at: 'desc' }
    });

    if (!complaint) return null;

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
    const existing = await prisma.complaint.findFirst({
      where: {
        OR: [
          { id: cleanId },
          { complaint_number: { equals: cleanId, mode: 'insensitive' } }
        ]
      }
    });

    if (!existing) {
      throw new Error('Complaint not found');
    }

    if (existing.status !== 'resolved') {
      throw new Error('Only complaints marked as RESOLVED by administration can be confirmed by citizens.');
    }

    const updated = await prisma.complaint.update({
      where: { id: existing.id },
      data: {
        user_confirmed: true,
        user_confirmed_at: new Date()
      }
    });

    await prisma.complaintUpdate.create({
      data: {
        complaint_id: existing.id,
        status: 'resolved' as any,
        remark: 'नागरिक द्वारा समाधान की पुष्टि की गई (Citizen Confirmed Resolution)',
        updated_by: null
      }
    });

    return updated;
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

    const existing = await prisma.complaint.findUnique({
      where: { id: complaintId }
    });

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

    const updatedComplaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status: status as any
      }
    });

    await prisma.complaintUpdate.create({
      data: {
        complaint_id: complaintId,
        status: status as any,
        remark,
        updated_by: updatedBy
      }
    });

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
    const updated = await prisma.complaint.update({
      where: { id },
      data: {
        is_archived: isArchived,
        archived_at: isArchived ? new Date() : null
      }
    });

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
    await prisma.complaintUpdate.deleteMany({ where: { complaint_id: id } });
    await prisma.complaint.delete({ where: { id } });
    return true;
  } catch (error: any) {
    throw new Error('Failed to delete complaint');
  }
}

export async function getComplaintCounts() {
  try {
    const activeCounts = await prisma.complaint.groupBy({
      by: ['status'],
      where: { is_archived: false },
      _count: { status: true },
    });

    let total = 0, newC = 0, in_progress = 0, resolved = 0;
    for (const c of activeCounts) {
      const cnt = c._count.status;
      total += cnt;
      if (c.status === 'new') newC = cnt;
      if (c.status === 'in_progress') in_progress = cnt;
      if (c.status === 'resolved') resolved = cnt;
    }

    const confirmedCount = await prisma.complaint.count({
      where: { user_confirmed: true, is_archived: false },
    });

    const archivedCount = await prisma.complaint.count({
      where: { is_archived: true },
    });

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
    return await prisma.complaint.count({
      where: { status: 'new', is_archived: false },
    });
  } catch (error) {
    return 0;
  }
}
