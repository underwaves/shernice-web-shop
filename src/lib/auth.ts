import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_COOKIE_NAME = 'shernice_admin_token';
const DEV_SECRET = 'shernice-super-secure-jwt-secret-key-32chars-2025-token';

function getSessionSecret(): string {
  return process.env.JWT_SECRET || DEV_SECRET;
}

export function createToken(code: string): string {
  const payload = `${code}:${Date.now()}`;
  const hmac = crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64');
}

export function verifyToken(token: string): boolean {
  try {
    const raw = Buffer.from(token, 'base64').toString('utf8');
    const parts = raw.split(':');
    if (parts.length !== 3) return false;
    const [code, timestamp, hmac] = parts;
    const expected = crypto.createHmac('sha256', getSessionSecret()).update(`${code}:${timestamp}`).digest('hex');
    const providedBuffer = Buffer.from(hmac, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');
    if (providedBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(providedBuffer, expectedBuffer)) return false;
    // Expire session after 7 days
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 7 * 24 * 60 * 60 * 1000) return false;
    return true;
  } catch {
    return false;
  }
}

export async function checkAdminPassword(enteredCode: string): Promise<boolean> {
  const setting = await prisma.setting.findFirst({ where: { id: 1 } });
  if (!setting || !setting.adminPasswordHash) {
    if (process.env.NODE_ENV === 'production') return false;
    const initialCode = process.env.ADMIN_INITIAL_CODE;
    return Boolean(initialCode && enteredCode === initialCode);
  }
  return bcrypt.compareSync(enteredCode, setting.adminPasswordHash);
}

export async function setAdminPassword(newCode: string): Promise<void> {
  const hash = bcrypt.hashSync(newCode, 10);
  await prisma.setting.update({
    where: { id: 1 },
    data: { adminPasswordHash: hash },
  });
}

export async function isUserAdmin(): Promise<boolean> {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

export { SESSION_COOKIE_NAME };
