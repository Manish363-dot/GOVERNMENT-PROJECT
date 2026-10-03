import { prisma } from '../config/prisma';
import { Complaint } from '@prisma/client';
import crypto from 'crypto';

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
        status: 'new' as any
      }
    });
    return newComplaint;
  } catch (error) {
    throw new Error('Failed to register complaint');
  }
}

export async function getAllComplaints(status?: string) {
  try {
    return await prisma.complaint.findMany({
      where: status && status !== 'all' ? { status: status as any } : undefined,
      orderBy: { created_at: 'desc' }
    });
  } catch (error) {
    throw new Error('Failed to fetch complaints');
  }
}

export async function getComplaintById(id: string) {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        updates: {
          orderBy: { updated_at: 'desc' }
        }
      }
    });
    if (!complaint) return null;

    // Separate updates to match old structure slightly
    const { updates, ...complaintData } = complaint;
    return { complaint: complaintData, updates };
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
      include: {
        updates: {
          orderBy: { updated_at: 'desc' }
        }
      }
    });

    if (!complaint) return null;

    const { updates, ...complaintData } = complaint;
    return { complaint: complaintData, updates };
  } catch (error) {
    return null;
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

    return await prisma.$transaction(async (tx) => {
      const existing = await tx.complaint.findUnique({
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

      const complaint = await tx.complaint.update({
        where: { id: complaintId },
        data: { status: status as any }
      });

      await tx.complaintUpdate.create({
        data: {
          complaint_id: complaintId,
          status: status as any,
          remark,
          updated_by: updatedBy
        }
      });

      return complaint;
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update complaint');
  }
}

export async function getComplaintCounts() {
  try {
    const counts = await prisma.complaint.groupBy({
      by: ['status'],
      _count: true
    });

    let total = 0, newC = 0, in_progress = 0, resolved = 0;
    for (const c of counts) {
      total += c._count;
      if (c.status === 'new') newC = c._count;
      if (c.status === 'in_progress') in_progress = c._count;
      if (c.status === 'resolved') resolved = c._count;
    }

    return { total, new: newC, in_progress, resolved };
  } catch (error) {
    return { total: 0, new: 0, in_progress: 0, resolved: 0 };
  }
}

export async function getNewComplaintCount(): Promise<number> {
  try {
    return await prisma.complaint.count({
      where: { status: 'new' }
    });
  } catch (error) {
    return 0;
  }
}
