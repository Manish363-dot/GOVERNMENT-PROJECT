import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { Profile } from '../types';
import { sendVerificationOtpEmail, sendPasswordResetOtpEmail } from './email.service';
import crypto from 'crypto';

interface PendingRegistration {
  userId: string;
  fullName: string;
  email: string;
  otp: string;
  expiresAt: number;
}

// In-memory cache for fast OTP verification
const pendingRegistrations = new Map<string, PendingRegistration>();

interface PendingPasswordReset {
  userId: string;
  email: string;
  otp: string;
  expiresAt: number;
  attempts: number;
  verifiedToken: string | null;
}

// In-memory cache for password resets
const pendingPasswordResets = new Map<string, PendingPasswordReset>();

/**
 * Verify admin passkey and initiate unconfirmed admin registration with OTP.
 */
export async function signupAdmin(
  fullName: string,
  email: string,
  password: string,
  passkey: string
): Promise<{ email: string; requiresOtp: boolean; message: string }> {
  // 1. Verify passkey
  if (passkey !== env.ADMIN_PASSKEY) {
    throw new Error('INVALID_PASSKEY');
  }

  // 2. Validate email format
  const emailNormalized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(emailNormalized)) {
    throw new Error('INVALID_EMAIL_FORMAT');
  }

  // 3. Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

  // 4. Check if user already exists in Supabase
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find((u) => u.email?.toLowerCase() === emailNormalized);

  let userId: string;

  if (existingUser) {
    if (existingUser.email_confirmed_at) {
      throw new Error('EMAIL_ALREADY_REGISTERED');
    }
    // Update existing unconfirmed user with new password & OTP
    userId = existingUser.id;
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: {
        full_name: fullName,
        verification_otp: otp,
        otp_expires_at: expiresAt,
      },
    });
  } else {
    // Create new unconfirmed user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: emailNormalized,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        verification_otp: otp,
        otp_expires_at: expiresAt,
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }
    userId = authData.user.id;
  }

  // Store in memory cache
  pendingRegistrations.set(emailNormalized, {
    userId,
    fullName,
    email: emailNormalized,
    otp,
    expiresAt,
  });

  // 5. Send verification email
  await sendVerificationOtpEmail(emailNormalized, fullName, otp);

  return {
    email: emailNormalized,
    requiresOtp: true,
    message: `Verification code sent to ${emailNormalized}`,
  };
}

/**
 * Verify OTP and activate admin account.
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<{ verified: boolean; message: string; profile: Profile }> {
  const emailNormalized = email.trim().toLowerCase();
  const pending = pendingRegistrations.get(emailNormalized);

  let userId = pending?.userId;
  let fullName = pending?.fullName;
  let validOtp = pending?.otp;
  let expiresAt = pending?.expiresAt;

  if (!pending) {
    // Fallback to Supabase users lookup
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    const user = users.find((u) => u.email?.toLowerCase() === emailNormalized);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }
    userId = user.id;
    fullName = user.user_metadata?.full_name || 'Admin';
    validOtp = user.user_metadata?.verification_otp;
    expiresAt = user.user_metadata?.otp_expires_at;
  }

  if (!validOtp || validOtp !== otp.trim()) {
    throw new Error('INVALID_OTP');
  }

  if (expiresAt && Date.now() > expiresAt) {
    throw new Error('OTP_EXPIRED');
  }

  // Confirm email in Supabase Auth
  await supabaseAdmin.auth.admin.updateUserById(userId!, {
    email_confirm: true,
  });

  // Create or update admin profile in database
  const { data: existingProfile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId!)
    .maybeSingle();

  let profile = existingProfile;

  if (!profile) {
    const { data: newProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId!,
        full_name: fullName || emailNormalized.split('@')[0],
        email: emailNormalized,
        role: 'admin',
      })
      .select()
      .single();

    if (profileError) {
      throw new Error('Failed to create admin profile: ' + profileError.message);
    }
    profile = newProfile;
  }

  // Clear from pending
  pendingRegistrations.delete(emailNormalized);

  return {
    verified: true,
    message: 'Official account successfully verified and activated',
    profile,
  };
}

/**
 * Resend OTP to email.
 */
export async function resendOtp(email: string): Promise<{ sent: boolean; message: string }> {
  const emailNormalized = email.trim().toLowerCase();
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.find((u) => u.email?.toLowerCase() === emailNormalized);

  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  if (user.email_confirmed_at) {
    throw new Error('EMAIL_ALREADY_CONFIRMED');
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 15 * 60 * 1000;
  const fullName = user.user_metadata?.full_name || 'Admin';

  await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      verification_otp: otp,
      otp_expires_at: expiresAt,
    },
  });

  pendingRegistrations.set(emailNormalized, {
    userId: user.id,
    fullName,
    email: emailNormalized,
    otp,
    expiresAt,
  });

  await sendVerificationOtpEmail(emailNormalized, fullName, otp);

  return {
    sent: true,
    message: `A new verification code has been sent to ${emailNormalized}`,
  };
}

/**
 * Get admin profile by user ID.
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

/**
 * Create admin profile for a Google OAuth user (called after OAuth completes).
 * Idempotent: returns existing profile without error if already created.
 */
export async function createGoogleAdminProfile(
  userId: string,
  email: string,
  fullName: string,
  passkey: string
): Promise<Profile> {
  // Verify passkey — same gate as email/password signup
  if (passkey !== env.ADMIN_PASSKEY) {
    throw new Error('INVALID_PASSKEY');
  }

  // Check if profile already exists (idempotent)
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return existing;

  // Create new admin profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: userId,
      full_name: fullName || email.split('@')[0],
      email,
      role: 'admin',
    })
    .select()
    .single();

  if (profileError) {
    throw new Error('Failed to create admin profile: ' + profileError.message);
  }

  return profile;
}

/**
 * Update admin profile.
 */
export async function updateProfile(
  userId: string,
  updates: { full_name?: string }
): Promise<Profile> {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw new Error('Failed to update profile');
  return data;
}

/**
 * Initiates a password reset flow by sending an OTP to the user's email.
 * Always returns a generic success message to prevent user enumeration.
 */
export async function forgotPassword(email: string): Promise<{ message: string }> {
  const emailNormalized = email.trim().toLowerCase();
  
  // Look up user in Supabase
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find((u) => u.email?.toLowerCase() === emailNormalized);

  // If user doesn't exist, we still return success but do nothing
  if (!existingUser) {
    return { message: 'If an account exists for this email, a verification OTP has been sent.' };
  }

  // Generate a secure 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  pendingPasswordResets.set(emailNormalized, {
    userId: existingUser.id,
    email: emailNormalized,
    otp,
    expiresAt,
    attempts: 0,
    verifiedToken: null,
  });

  await sendPasswordResetOtpEmail(emailNormalized, otp);

  return { message: 'If an account exists for this email, a verification OTP has been sent.' };
}

/**
 * Verifies the 6-digit OTP for password reset and issues a reset token.
 */
export async function verifyPasswordResetOtp(email: string, otp: string): Promise<{ message: string; resetToken: string }> {
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

  // Generate a secure token to allow password reset
  const resetToken = crypto.randomBytes(32).toString('hex');
  pendingReset.verifiedToken = resetToken;

  return { message: 'OTP verified successfully.', resetToken };
}

/**
 * Resets the password using the verified reset token.
 */
export async function resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ message: string }> {
  const emailNormalized = email.trim().toLowerCase();
  const pendingReset = pendingPasswordResets.get(emailNormalized);

  if (!pendingReset || !pendingReset.verifiedToken || pendingReset.verifiedToken !== resetToken) {
    throw new Error('INVALID_RESET_TOKEN');
  }
  
  if (Date.now() > pendingReset.expiresAt) {
    pendingPasswordResets.delete(emailNormalized);
    throw new Error('TOKEN_EXPIRED');
  }

  // Update password via Supabase Admin (securely hashes)
  const { error } = await supabaseAdmin.auth.admin.updateUserById(pendingReset.userId, {
    password: newPassword
  });

  if (error) {
    throw new Error(error.message);
  }

  // Invalidate the session
  pendingPasswordResets.delete(emailNormalized);

  return { message: 'Password has been successfully updated.' };
}
