import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';
import { tryAwardPointForOrder } from '@/lib/points';

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

    const order = await prisma.order.findUnique({
      where: { queueNumber },
    });

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบออเดอร์นี้' }, { status: 404 });
    }

    // If admin marks order as in progress or completed, auto-approve slip if slip is attached
    const isMovingForward = status === 'กำลังดำเนินการ' || status === 'เสร็จแล้ว';
    const shouldApproveSlip = isMovingForward && !!order.slipUrl && !order.slipApproved;

    const updated = await prisma.order.update({
      where: { queueNumber },
      data: {
        status,
        ...(shouldApproveSlip ? { slipApproved: true } : {}),
      },
    });

    let pointResult: any = null;
    if (shouldApproveSlip) {
      pointResult = await tryAwardPointForOrder(order.id);
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_ORDER_STATUS',
        details: `Updated queue ${queueNumber} status to ${status}${shouldApproveSlip ? ' (Auto-approved slip)' : ''}`,
      },
    });

    return NextResponse.json({
      ...updated,
      pointResult,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
