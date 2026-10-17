import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import type { AuthUser } from '@/types';

const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET environment variable is not defined.');
}
const secretKey = new TextEncoder().encode(JWT_SECRET || 'ats-development-session-signing-fallback-key');
const COOKIE_NAME = 'ats_token';
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function signToken(payload: AuthUser): Promise<string> {
  return new SignJWT({
    id: payload.id,
    name: payload.name,
    email: payload.email,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.id as string,
      name: payload.name as string,
      email: payload.email as string,
    };
  } catch {
    return null;
  }
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export { COOKIE_NAME, MAX_AGE };
