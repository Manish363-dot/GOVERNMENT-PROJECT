import { prisma } from '../config/prisma';
import { Complaint } from '@prisma/client';
import crypto from 'crypto';
import { sendRealSmsOtp, sendConfirmationSms, validateMessageCentralOtp } from './sms.service';
import { otpConfig } from '../config/env';

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

// ─── OTP Security Store ───────────────────────────────────────────────────────
interface OtpRecord {
  otp: string;
  verificationId?: string; // Message Central Verification ID for remote OTP validation
  expiresAt: number;       // OTP validity from env
  attempts: number;        // Wrong OTP attempts
  sentAt: number;          // When last OTP was sent (for resend cooldown)
  sendCount: number;       // Total OTPs sent in current window
  windowStart: number;     // Start of rate-limit window
}

// Per-mobile OTP records
const complaintOtpMap = new Map<string, OtpRecord>();

// Auto-cleanup expired OTP records every 10 minutes (memory hygiene)
setInterval(() => {
  const now = Date.now();
  for (const [mobile, record] of complaintOtpMap.entries()) {
    // Remove if OTP expired AND rate-limit window also expired
    if (now > record.expiresAt && now > record.windowStart + otpConfig.rateWindowMs) {
      complaintOtpMap.delete(mobile);
    }
  }
}, 10 * 60 * 1000);

export async function sendComplaintOtp(mobile: string) {
  const check = isValidRealWorldMobile(mobile);
  if (!check.valid) {
    throw new Error(check.reason || 'Invalid mobile number');
  }

  const cleanMobile = mobile.replace(/\D/g, '');
  const now = Date.now();
  const existing = complaintOtpMap.get(cleanMobile);

  // ── 1. Resend Cooldown: Must wait before requesting again ──
  if (existing && existing.sentAt) {
    const secondsSinceLast = Math.ceil((now - existing.sentAt) / 1000);
    const waitSeconds = Math.ceil(otpConfig.resendCooldownMs / 1000) - secondsSinceLast;
    if (waitSeconds > 0) {
      throw new Error(
        `OTP already sent. Please wait ${waitSeconds} second${waitSeconds !== 1 ? 's' : ''} before requesting again. / OTP पहले ही भेजा जा चुका है। ${waitSeconds} सेकंड बाद पुनः प्रयास करें।`
      );
    }
  }

  // ── 2. Hourly Rate Limit: Max OTPs per mobile per window ──
  if (existing) {
    const windowExpired = now > existing.windowStart + otpConfig.rateWindowMs;
    if (!windowExpired && existing.sendCount >= otpConfig.maxPerHour) {
      const resetInMins = Math.ceil((existing.windowStart + otpConfig.rateWindowMs - now) / 60000);
      throw new Error(
        `Too many OTP requests. Maximum ${otpConfig.maxPerHour} OTPs allowed per hour. Try again in ${resetInMins} minute${resetInMins !== 1 ? 's' : ''}. / प्रति घंटे अधिकतम ${otpConfig.maxPerHour} OTP अनुरोध की सीमा पार हो गई। ${resetInMins} मिनट बाद पुनः प्रयास करें।`
      );
    }
  }

  const otp = crypto.randomInt(1000, 9999).toString();

  // Send Real SMS
  const smsResult = await sendRealSmsOtp(cleanMobile, otp);

  // ── Build updated record ──
  const isNewWindow = !existing || now > existing.windowStart + otpConfig.rateWindowMs;
  const updatedRecord: OtpRecord = {
    otp,
    verificationId: smsResult.verificationId,
    expiresAt: now + otpConfig.expiryMs,
    attempts: 0,
    sentAt: now,
    sendCount: isNewWindow ? 1 : (existing!.sendCount + 1),
    windowStart: isNewWindow ? now : existing!.windowStart,
  };

  complaintOtpMap.set(cleanMobile, updatedRecord);

  console.log(`📤 [OTP] Sending to +91 ${cleanMobile} | Attempt ${updatedRecord.sendCount}/${otpConfig.maxPerHour} this window | VerificationID: ${smsResult.verificationId || 'NONE'}`);

  return {
    success: true,
    message: smsResult.sent
      ? `Verification SMS sent to +91 ${cleanMobile}`
      : `Verification OTP sent to +91 ${cleanMobile}`,
    devOtp: smsResult.sent ? undefined : otp,
    remainingResends: otpConfig.maxPerHour - updatedRecord.sendCount,
  };
}

export async function createComplaint(complaint: {
  name: string;
  mobile: string;
  area: string;
  complaint_type: string;
  description?: string;
  otp: string; // Required — OTP verification is mandatory
}) {
  const check = isValidRealWorldMobile(complaint.mobile);
  if (!check.valid) {
    throw new Error(check.reason || 'Invalid mobile number');
  }

  const cleanMobile = complaint.mobile.replace(/\D/g, '');

  // OTP verification is MANDATORY
  if (!complaint.otp || complaint.otp.trim().length !== 4) {
    throw new Error('OTP is required. Please enter the 4-digit verification code sent to your mobile.');
  }

  const storedOtp = complaintOtpMap.get(cleanMobile);
  if (!storedOtp) {
    throw new Error('OTP not found or expired. Please click "Get OTP" first.');
  }
  if (Date.now() > storedOtp.expiresAt) {
    complaintOtpMap.delete(cleanMobile);
    throw new Error('OTP has expired. Please request a new OTP code.');
  }
  if (storedOtp.attempts >= otpConfig.maxWrongAttempts) {
    complaintOtpMap.delete(cleanMobile);
    throw new Error(`Too many wrong OTP attempts (${otpConfig.maxWrongAttempts} max). Please request a new OTP. / बहुत अधिक गलत OTP प्रयास। कृपया नया OTP मंगवाएं।`);
  }

  // Verify OTP — Use Message Central API if real SMS verificationId exists, else fallback to local code
  if (storedOtp.verificationId) {
    const valResult = await validateMessageCentralOtp(storedOtp.verificationId, complaint.otp.trim());
    if (!valResult.valid) {
      storedOtp.attempts += 1;
      throw new Error('Invalid OTP code. Please enter the correct 4-digit verification code sent to your mobile.');
    }
  } else {
    if (storedOtp.otp !== complaint.otp.trim()) {
      storedOtp.attempts += 1;
      throw new Error('Invalid OTP code. Please enter the correct 4-digit verification code.');
    }
  }

  complaintOtpMap.delete(cleanMobile);

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

    // ── Send Confirmation SMS (non-blocking — doesn't delay response) ──
    sendConfirmationSms(cleanMobile, complaintNumber, sanitize(complaint.name)).catch((err) => {
      console.error('⚠️ Confirmation SMS failed (non-blocking):', err.message);
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
