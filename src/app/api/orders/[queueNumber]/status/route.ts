import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { queueNumber: string } }
) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const queueNumber = decodeURIComponent(params.queueNumber).trim();
    const { status } = await request.json();

    const validStatuses = ['รอชำระเงิน', 'กำลังดำเนินการ', 'เสร็จแล้ว', 'ยกเลิก'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { queueNumber },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_ORDER_STATUS',
        details: `Updated queue ${queueNumber} status to ${status}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
