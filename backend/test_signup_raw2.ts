import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSupabaseAuth() {
  const email = `testuser_${Date.now()}@example.com`;
  console.log('Testing createUser without email_confirm...');
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: 'password123',
    // email_confirm: true,
  });

  if (error) {
    console.error('Failed without email_confirm:', error.message);
  } else {
    console.log('Success! User ID:', data.user.id);
  }
}

testSupabaseAuth();
