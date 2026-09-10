import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSupabaseAuth() {
  const email = `testuser_${Date.now()}@example.com`;
  console.log('Attempting to create user:', email);
  
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: 'password123',
    email_confirm: true,
  });

  if (error) {
    console.error('Full Error Object:');
    console.dir(error, { depth: null });
  } else {
    console.log('Success User ID:', data.user.id);
    
    // Test inserting profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: data.user.id,
        full_name: 'Test Name',
        email: email,
        role: 'admin',
      });
      
    if (profileError) {
      console.error('Profile Insert Error:', profileError);
    } else {
      console.log('Profile inserted successfully!');
    }
  }
}

testSupabaseAuth();
