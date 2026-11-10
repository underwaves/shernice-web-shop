import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'ไม่พบรีวิวนี้' }, { status: 404 });
    }

    await prisma.review.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_REVIEW',
        details: `Deleted review ID ${id} (Customer: ${existing.customerName}, Queue: ${existing.queueNumber || '-'})`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ลบรีวิวเรียบร้อยแล้ว',
    });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
  }
}
