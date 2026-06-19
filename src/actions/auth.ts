'use server';

import { signIn, signOut } from '@/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { AuthError } from 'next-auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function loginAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = loginSchema.parse(rawData);

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { success: false, error: 'Invalid credentials.' };
        default:
          return { success: false, error: 'Something went wrong.' };
      }
    }
    throw error;
  }
}

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const rawData = Object.fromEntries(formData.entries());
    const validatedData = registerSchema.parse(rawData);

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (existingUser) {
      return { success: false, error: 'Email already exists' };
    }

    const passwordHash = await bcrypt.hash(validatedData.password, 10);

    await db.insert(users).values({
      name: validatedData.name,
      email: validatedData.email,
      passwordHash,
      role: 'USER',
      diamondBalance: 1000, // Give new users 1000 free diamonds to play with!
    });

    return { success: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Invalid input data' };
    }
    console.error('Registration error:', error);
    return { success: false, error: 'Failed to register. Please try again later.' };
  }
}

export async function logoutAction() {
  await signOut({ redirect: true, redirectTo: '/login' });
}
