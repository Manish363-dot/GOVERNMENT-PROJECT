import { prisma } from '../config/prisma';
import { Complaint } from '@prisma/client';
import crypto from 'crypto';
import { sendRealSmsOtp } from './sms.service';

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
const complaintOtpMap = new Map<string, { otp: string; expiresAt: number; attempts: number }>();

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
  });

  // Send Real SMS via SMS Gateway (Fast2SMS / Twilio) or Console Fallback
  const smsResult = await sendRealSmsOtp(cleanMobile, otp);

  return {
    success: true,
    message: smsResult.sent
      ? `Verification SMS code sent to +91 ${cleanMobile}`
      : `Verification OTP sent to +91 ${cleanMobile}`,
    devOtp: smsResult.sent ? undefined : otp, // Hide devOtp when real SMS gateway is active!
  };
}

export async function createComplaint(complaint: {
  name: string;
  mobile: string;
  area: string;
  complaint_type: string;
  description?: string;
  otp?: string;
}) {
  const check = isValidRealWorldMobile(complaint.mobile);
  if (!check.valid) {
    throw new Error(check.reason || 'Invalid mobile number');
  }

  const cleanMobile = complaint.mobile.replace(/\D/g, '');

  // If OTP is provided, verify it
  if (complaint.otp) {
    const storedOtp = complaintOtpMap.get(cleanMobile);
    if (!storedOtp) {
      throw new Error('OTP not found or expired. Please click "Get OTP" first.');
    }
    if (Date.now() > storedOtp.expiresAt) {
      complaintOtpMap.delete(cleanMobile);
      throw new Error('OTP has expired. Please request a new OTP code.');
    }
    if (storedOtp.attempts >= 5) {
      complaintOtpMap.delete(cleanMobile);
      throw new Error('Too many invalid OTP attempts. Please request a new OTP.');
    }
    if (storedOtp.otp !== complaint.otp.trim()) {
      storedOtp.attempts += 1;
      throw new Error('Invalid OTP code. Please enter the correct 6-digit verification code.');
    }
    complaintOtpMap.delete(cleanMobile);
  }

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
