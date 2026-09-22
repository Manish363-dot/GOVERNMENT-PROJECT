import { env } from '../config/env';
import { prisma } from '../config/prisma';
import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from './email.service';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID || 'placeholder_google_client_id');

interface PendingRegistration {
  userId: string;
  fullName: string;
  email: string;
  otp: string;
  expiresAt: number;
}

const pendingRegistrations = new Map<string, PendingRegistration>();

interface PendingPasswordReset {
  userId: string;
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  verifiedToken: string | null;
}

const pendingPasswordResets = new Map<string, PendingPasswordReset>();

export async function login(email: string, password: string) {
  const emailNormalized = email.trim().toLowerCase();

  const admin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  if (!admin) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { userId: admin.id, role: admin.role, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, profile: { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role } };
}

export async function signupAdmin(
  fullName: string,
  email: string,
  password: string,
  passkey: string
) {
  if (passkey !== env.ADMIN_PASSKEY) {
    throw new Error('INVALID_PASSKEY');
  }

  const emailNormalized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailNormalized)) {
    throw new Error('INVALID_EMAIL_FORMAT');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  const existingAdmin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  let userId: string;

  if (existingAdmin) {
    if (existingAdmin.isVerified) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }
    // Update existing unconfirmed admin with new password & OTP
    const passwordHash = await bcrypt.hash(password, 10);
    const updated = await prisma.profile.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        full_name: fullName,
      }
    });
    userId = updated.id;
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    const newAdmin = await prisma.profile.create({
      data: {
        email: emailNormalized,
        full_name: fullName,
        passwordHash,
        role: 'admin',
        isVerified: false
      }
    });
    userId = newAdmin.id;
  }

  pendingRegistrations.set(emailNormalized, {
    userId,
    fullName,
    email: emailNormalized,
    otp,
    expiresAt,
  });

  await sendVerificationOtpEmail(emailNormalized, fullName, otp);

  return {
    email: emailNormalized,
    requiresOtp: true,
    message: `Verification code sent to ${emailNormalized}`,
  };
}

export async function verifyOtp(email: string, otp: string) {
  const emailNormalized = email.trim().toLowerCase();
  const pending = pendingRegistrations.get(emailNormalized);

  if (!pending) {
    throw new Error('USER_NOT_FOUND');
  }

  if (pending.otp !== otp.trim()) {
    throw new Error('INVALID_OTP');
  }

  if (Date.now() > pending.expiresAt) {
    throw new Error('OTP_EXPIRED');
  }

  const admin = await prisma.profile.update({
    where: { id: pending.userId },
    data: { isVerified: true }
  });

  pendingRegistrations.delete(emailNormalized);

  return {
    verified: true,
    message: 'Official account successfully verified and activated',
    profile: { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role },
  };
}

export async function resendOtp(email: string) {
  const emailNormalized = email.trim().toLowerCase();

  const admin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  if (!admin) {
    throw new Error('USER_NOT_FOUND');
  }

  if (admin.isVerified) {
    throw new Error('EMAIL_ALREADY_CONFIRMED');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;

  pendingRegistrations.set(emailNormalized, {
    userId: admin.id,
    fullName: admin.full_name,
    email: emailNormalized,
    otp,
    expiresAt,
  });

  await sendVerificationOtpEmail(emailNormalized, admin.full_name, otp);

  return {
    sent: true,
    message: `A new verification code has been sent to ${emailNormalized}`,
  };
}

export async function getProfile(userId: string) {
  const admin = await prisma.profile.findUnique({
    where: { id: userId },
    select: { id: true, full_name: true, email: true, role: true }
  });
  return admin;
}

export async function updateProfile(userId: string, updates: { full_name?: string }) {
  const admin = await prisma.profile.update({
    where: { id: userId },
    data: { ...updates },
    select: { id: true, full_name: true, email: true, role: true }
  });
  return admin;
}

export async function forgotPassword(email: string) {
  const emailNormalized = email.trim().toLowerCase();

  const existingAdmin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  if (!existingAdmin) {
    return { message: 'If an account exists for this email, a verification OTP has been sent.' };
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  pendingPasswordResets.set(emailNormalized, {
    userId: existingAdmin.id,
    email: emailNormalized,
    otp,
    expiresAt,
    attempts: 0,
    verifiedToken: null,
  });

  await sendPasswordResetOtpEmail(emailNormalized, otp);

  return { message: 'If an account exists for this email, a verification OTP has been sent.' };
}

export async function verifyPasswordResetOtp(email: string, otp: string) {
  const emailNormalized = email.trim().toLowerCase();
  const pendingReset = pendingPasswordResets.get(emailNormalized);

  if (!pendingReset) {
    throw new Error('NO_PENDING_RESET');
  }

  if (Date.now() > pendingReset.expiresAt) {
    pendingPasswordResets.delete(emailNormalized);
    throw new Error('OTP_EXPIRED');
  }

  if (pendingReset.otp !== otp) {
    pendingReset.attempts += 1;
    if (pendingReset.attempts >= 3) {
      pendingPasswordResets.delete(emailNormalized);
      throw new Error('TOO_MANY_ATTEMPTS');
    }
    throw new Error('INVALID_OTP');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  pendingReset.verifiedToken = resetToken;

  return { message: 'OTP verified successfully.', resetToken };
}

export async function resetPassword(email: string, resetToken: string, newPassword: string) {
  const emailNormalized = email.trim().toLowerCase();
  const pendingReset = pendingPasswordResets.get(emailNormalized);

  if (!pendingReset || !pendingReset.verifiedToken || pendingReset.verifiedToken !== resetToken) {
    throw new Error('INVALID_RESET_TOKEN');
  }

  if (Date.now() > pendingReset.expiresAt) {
    pendingPasswordResets.delete(emailNormalized);
    throw new Error('TOKEN_EXPIRED');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.profile.update({
    where: { id: pendingReset.userId },
    data: { passwordHash }
  });

  pendingPasswordResets.delete(emailNormalized);

  return { message: 'Password has been successfully updated.' };
}

export async function googleLogin(idToken: string, passkey?: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error('INVALID_GOOGLE_TOKEN');
  
  const emailNormalized = payload.email.trim().toLowerCase();
  let profile = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  if (!profile) {
    if (!passkey) {
      throw new Error('PASSKEY_REQUIRED');
    }
    if (passkey !== env.ADMIN_PASSKEY) {
      throw new Error('INVALID_PASSKEY');
    }
    profile = await prisma.profile.create({
      data: {
        email: emailNormalized,
        full_name: payload.name || 'Google User',
        passwordHash: '',
        role: 'admin',
        isVerified: true
      }
    });
  }

  const token = jwt.sign(
    { userId: profile.id, role: profile.role, email: profile.email },
    env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { token, profile: { id: profile.id, full_name: profile.full_name, email: profile.email, role: profile.role } };
}
