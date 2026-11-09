import { NextResponse } from 'next/server';
import { isUserAdmin } from '@/lib/auth';

export async function GET() {
  const isAdmin = await isUserAdmin();
  return NextResponse.json({ authenticated: isAdmin });
}
