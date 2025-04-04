import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createToken(organizationId: string): Promise<string> {
  return new SignJWT({ organizationId })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(new TextEncoder().encode(JWT_SECRET));
}

export async function verifyToken(token: string): Promise<{ organizationId: string } | null> {
  try {
    const verified = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return verified.payload as { organizationId: string };
  } catch (error) {
    return null;
  }
}

export async function getCurrentOrganization() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;
  
  const payload = await verifyToken(token);
  if (!payload) return null;
  
  return prisma.organization.findUnique({
    where: { id: payload.organizationId }
  });
}

export async function requireAuth(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  const payload = await verifyToken(token);
  if (!payload) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  
  return { organizationId: payload.organizationId };
} 