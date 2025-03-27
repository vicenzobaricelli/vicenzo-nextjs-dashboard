import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { neon } from '@neondatabase/serverless';
import bcrypt from 'bcrypt';

// Function to fetch the user from the database
async function getUser(email) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const user = await sql`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0]; // Assuming the first row is the user
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        // Validate input credentials
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          
          // Fetch user from database
          const user = await getUser(email);
          if (!user) {
            console.log('User not found');
            return null;
          }

          // Compare passwords using bcrypt
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return user; // Successful authentication
          }
        }

        console.log('Invalid credentials');
        return null; // Authentication failed
      },
    }),
  ],
});

