import { supabaseAdmin } from '../config/supabase';
import { env } from '../config/env';
import { Profile } from '../types';

/**
 * Verify admin passkey and create admin account.
 */
export async function signupAdmin(
  fullName: string,
  email: string,
  password: string,
  passkey: string
): Promise<{ user: any; profile: Profile }> {
  // Verify passkey
  if (passkey !== env.ADMIN_PASSKEY) {
    throw new Error('INVALID_PASSKEY');
  }

  // Create user in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error('Failed to create user');
  }

  // Create admin profile
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      role: 'admin',
    })
    .select()
    .single();

  if (profileError) {
    // Cleanup: delete auth user if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    throw new Error('Failed to create admin profile');
  }

  return { user: authData.user, profile };
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
