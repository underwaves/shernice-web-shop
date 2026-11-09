import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export async function GET() {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
