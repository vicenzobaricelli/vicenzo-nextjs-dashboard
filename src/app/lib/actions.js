'use server';

import { signIn } from '../../../auth';
import { AuthError } from 'next-auth';

export async function authenticate(prevState, formData) {
  try {
    const result = await signIn('credentials', { redirect: false, ...Object.fromEntries(formData) });
    if (result?.error) {
      return 'Invalid credentials.';
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return error.type === 'CredentialsSignin' ? 'Invalid credentials.' : 'Something went wrong.';
    }
    throw error;
  }
}




