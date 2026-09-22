import { env } from '../config/env';
import { prisma } from '../config/prisma';

import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from './email.service';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID || 'placeholder_google_client_id');

const BCRYPT_ROUNDS = 12;
const OTP_EXPIRY_MINUTES = 15;
const RESET_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const JWT_EXPIRY = '24h';

// ── Helpers ──────────────────────────────────────────────────────

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

async function verifyOtpHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

function validatePasswordStrength(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /\W/.test(password)
  );
}

// ── Login ────────────────────────────────────────────────────────

export async function login(email: string, password: string) {
  const emailNormalized = email.trim().toLowerCase();

  const admin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  if (!admin) {
    throw new Error('INVALID_CREDENTIALS');
  }

  // MED-1: Block unverified users from logging in
  if (!admin.isVerified) {
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const token = jwt.sign(
    { userId: admin.id, role: admin.role, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return { token, profile: { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role } };
}

// ── Signup ───────────────────────────────────────────────────────

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

  // MED-3: Enforce strong password on signup (same policy as reset)
  if (!validatePasswordStrength(password)) {
    throw new Error('WEAK_PASSWORD');
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const existingAdmin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  let userId: string;

  if (existingAdmin) {
    if (existingAdmin.isVerified) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }
    // Update existing unconfirmed admin with new password & OTP
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const updated = await prisma.profile.update({
      where: { id: existingAdmin.id },
      data: {
        passwordHash,
        full_name: fullName,
      }
    });
    userId = updated.id;
  } else {
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const newAdmin = await prisma.profile.create({
      data: {
        email: emailNormalized,
        full_name: fullName,
        passwordHash,
        role: 'admin',
        isVerified: false,
        authProvider: 'email',
      }
    });
    userId = newAdmin.id;
  }

  // CRIT-4: Store OTP in database instead of in-memory Map
  await prisma.pendingRegistration.upsert({
    where: { email: emailNormalized },
    update: {
      userId,
      otpHash,
      expiresAt,
      attempts: 0,
    },
    create: {
      email: emailNormalized,
      userId,
      otpHash,
      expiresAt,
    },
  });

  await sendVerificationOtpEmail(emailNormalized, fullName, otp);

  return {
    email: emailNormalized,
    requiresOtp: true,
    message: `Verification code sent to ${emailNormalized}`,
  };
}

// ── OTP Verification ─────────────────────────────────────────────

export async function verifyOtp(email: string, otp: string) {
  const emailNormalized = email.trim().toLowerCase();

  const pending = await prisma.pendingRegistration.findUnique({
    where: { email: emailNormalized },
  });

  if (!pending) {
    throw new Error('USER_NOT_FOUND');
  }

  if (new Date() > pending.expiresAt) {
    await prisma.pendingRegistration.delete({ where: { email: emailNormalized } });
    throw new Error('OTP_EXPIRED');
  }

  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    await prisma.pendingRegistration.delete({ where: { email: emailNormalized } });
    throw new Error('TOO_MANY_ATTEMPTS');
  }

  const isValid = await verifyOtpHash(otp.trim(), pending.otpHash);
  if (!isValid) {
    await prisma.pendingRegistration.update({
      where: { email: emailNormalized },
      data: { attempts: { increment: 1 } },
    });
    throw new Error('INVALID_OTP');
  }

  const admin = await prisma.profile.update({
    where: { id: pending.userId },
    data: { isVerified: true }
  });

  await prisma.pendingRegistration.delete({ where: { email: emailNormalized } });

  return {
    verified: true,
    message: 'Official account successfully verified and activated',
    profile: { id: admin.id, full_name: admin.full_name, email: admin.email, role: admin.role },
  };
}

// ── Resend OTP ───────────────────────────────────────────────────

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

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.pendingRegistration.upsert({
    where: { email: emailNormalized },
    update: {
      otpHash,
      expiresAt,
      attempts: 0,
    },
    create: {
      email: emailNormalized,
      userId: admin.id,
      otpHash,
      expiresAt,
    },
  });

  await sendVerificationOtpEmail(emailNormalized, admin.full_name, otp);

  return {
    sent: true,
    message: `A new verification code has been sent to ${emailNormalized}`,
  };
}

// ── Profile ──────────────────────────────────────────────────────

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

// ── Forgot Password ──────────────────────────────────────────────

export async function forgotPassword(email: string) {
  const emailNormalized = email.trim().toLowerCase();

  const existingAdmin = await prisma.profile.findUnique({
    where: { email: emailNormalized }
  });

  // Always return same message to prevent email enumeration
  if (!existingAdmin) {
    return { message: 'If an account exists for this email, a verification OTP has been sent.' };
  }

  // MED-2: Block password reset for Google-only accounts
  if (existingAdmin.authProvider === 'google') {
    return { message: 'If an account exists for this email, a verification OTP has been sent.' };
  }

  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MINUTES * 60 * 1000);

  await prisma.pendingPasswordReset.upsert({
    where: { email: emailNormalized },
    update: {
      userId: existingAdmin.id,
      otpHash,
      expiresAt,
      attempts: 0,
      verifiedToken: null,
    },
    create: {
      email: emailNormalized,
      userId: existingAdmin.id,
      otpHash,
      expiresAt,
    },
  });

  await sendPasswordResetOtpEmail(emailNormalized, otp);

  return { message: 'If an account exists for this email, a verification OTP has been sent.' };
}

// ── Verify Reset OTP ─────────────────────────────────────────────

export async function verifyPasswordResetOtp(email: string, otp: string) {
  const emailNormalized = email.trim().toLowerCase();

  const pendingReset = await prisma.pendingPasswordReset.findUnique({
    where: { email: emailNormalized },
  });

  if (!pendingReset) {
    throw new Error('NO_PENDING_RESET');
  }

  if (new Date() > pendingReset.expiresAt) {
    await prisma.pendingPasswordReset.delete({ where: { email: emailNormalized } });
    throw new Error('OTP_EXPIRED');
  }

  if (pendingReset.attempts >= 3) {
    await prisma.pendingPasswordReset.delete({ where: { email: emailNormalized } });
    throw new Error('TOO_MANY_ATTEMPTS');
  }

  const isValid = await verifyOtpHash(otp, pendingReset.otpHash);
  if (!isValid) {
    await prisma.pendingPasswordReset.update({
      where: { email: emailNormalized },
      data: { attempts: { increment: 1 } },
    });
    throw new Error('INVALID_OTP');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');

  await prisma.pendingPasswordReset.update({
    where: { email: emailNormalized },
    data: { verifiedToken: resetToken },
  });

  return { message: 'OTP verified successfully.', resetToken };
}

// ── Reset Password ───────────────────────────────────────────────

export async function resetPassword(email: string, resetToken: string, newPassword: string) {
  const emailNormalized = email.trim().toLowerCase();

  const pendingReset = await prisma.pendingPasswordReset.findUnique({
    where: { email: emailNormalized },
  });

  if (!pendingReset || !pendingReset.verifiedToken || pendingReset.verifiedToken !== resetToken) {
    throw new Error('INVALID_RESET_TOKEN');
  }

  if (new Date() > pendingReset.expiresAt) {
    await prisma.pendingPasswordReset.delete({ where: { email: emailNormalized } });
    throw new Error('TOKEN_EXPIRED');
  }

  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await prisma.profile.update({
    where: { id: pendingReset.userId },
    data: { passwordHash }
  });

  await prisma.pendingPasswordReset.delete({ where: { email: emailNormalized } });

  return { message: 'Password has been successfully updated.' };
}

// ── Google Login ─────────────────────────────────────────────────

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
    // MED-2: Use a random unguessable hash for Google-only users, not empty string
    const randomHash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), BCRYPT_ROUNDS);
    profile = await prisma.profile.create({
      data: {
        email: emailNormalized,
        full_name: payload.name || 'Google User',
        passwordHash: randomHash,
        role: 'admin',
        isVerified: true,
        authProvider: 'google',
      }
    });
  }

  const token = jwt.sign(
    { userId: profile.id, role: profile.role, email: profile.email },
    env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

  return { token, profile: { id: profile.id, full_name: profile.full_name, email: profile.email, role: profile.role } };
}
