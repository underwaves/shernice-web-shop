import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { customerId, amount, reason } = await request.json();

    if (!customerId || amount === undefined || isNaN(Number(amount))) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const numAmount = parseInt(amount, 10);
    const parsedReason = reason?.trim() || 'แอดมินปรับแต้มด้วยตนเอง';

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId, 10) },
    });

    if (!customer) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลลูกค้า' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedCust = await tx.customer.update({
        where: { id: customer.id },
        data: {
          pointsBalance: { increment: numAmount },
        },
      });

      const txRecord = await tx.pointTransaction.create({
        data: {
          customerId: customer.id,
          amount: numAmount,
          type: 'ADJUSTED',
          reason: parsedReason,
        },
      });

      return { updatedCust, txRecord };
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADJUST_POINTS',
        details: `Adjusted points for customer ${customer.name} (ID: ${customer.id}) by ${numAmount} (${parsedReason})`,
      },
    });

    return NextResponse.json({
      success: true,
      customer: updated.updatedCust,
      transaction: updated.txRecord,
    });
  } catch (error) {
    console.error('Error adjusting points:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการปรับแต้ม' }, { status: 500 });
  }
}
