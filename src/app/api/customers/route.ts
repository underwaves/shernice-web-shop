import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { contactId: { contains: search } },
      ];
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { pointsBalance: 'desc' },
      include: {
        pointTransactions: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error listing customers:', error);
    return NextResponse.json({ error: 'Failed to list customers' }, { status: 500 });
  }
}
