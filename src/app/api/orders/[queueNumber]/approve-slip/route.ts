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
    const { approved } = await request.json();

    const order = await prisma.order.findUnique({
      where: { queueNumber },
      include: { customer: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบหมายเลขคิวนี้' }, { status: 404 });
    }

    if (approved) {
      // Approve slip and set status to 'กำลังดำเนินการ' if currently 'รอชำระเงิน'
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          slipApproved: true,
          status: order.status === 'รอชำระเงิน' ? 'กำลังดำเนินการ' : order.status,
        },
      });

      // Try awarding point if eligible (must have approved review)
      const pointResult = await tryAwardPointForOrder(order.id);

      await prisma.auditLog.create({
        data: {
          action: 'APPROVE_SLIP',
          details: `Approved slip for queue ${queueNumber}. Point status: ${pointResult.message}`,
        },
      });

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        pointResult,
      });
    } else {
      // Reject slip
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          slipApproved: false,
          slipUrl: null,
          slipHash: null,
          status: 'รอชำระเงิน',
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'REJECT_SLIP',
          details: `Rejected slip for queue ${queueNumber}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'ปฏิเสธสลิปเรียบร้อยแล้ว',
        order: updatedOrder,
      });
    }
  } catch (error: any) {
    console.error('Error approving slip:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการตรวจสอบสลิป' },
      { status: 500 }
    );
  }
}
