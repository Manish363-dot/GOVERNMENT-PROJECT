import { signupAdmin } from './src/services/auth.service';

async function testSignup() {
  try {
    const result = await signupAdmin(
      'Test Admin',
      'testadmin4@example.com',
      'password123',
      'ADMIN1234'
    );
    console.log('Success:', result);
  } catch (error) {
    console.error('Error in signup:', error);
  }
}

testSignup();
