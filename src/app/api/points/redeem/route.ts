import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { customerId, rewardName, pointsRequired = 10 } = await request.json();

    if (!customerId || !rewardName) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(customerId, 10) },
    });

    if (!customer) {
      return NextResponse.json({ error: 'ไม่พบข้อมูลลูกค้า' }, { status: 404 });
    }

    if (customer.pointsBalance < pointsRequired) {
      return NextResponse.json(
        { error: `แต้มสะสมไม่เพียงพอ (ต้องการ ${pointsRequired} แต้ม แต่มี ${customer.pointsBalance} แต้ม)` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedCustomer = await tx.customer.update({
        where: { id: customer.id },
        data: {
          pointsBalance: { decrement: pointsRequired },
        },
      });

      const txRecord = await tx.pointTransaction.create({
        data: {
          customerId: customer.id,
          amount: -pointsRequired,
          type: 'REDEEMED',
          reason: `แลกของรางวัล: ${rewardName}`,
        },
      });

      return { updatedCustomer, txRecord };
    });

    return NextResponse.json({
      success: true,
      message: `แลกของรางวัล "${rewardName}" สำเร็จ! กรุณาแคปหน้าจอส่งให้ทางร้านใน Line นะคะ`,
      customer: updated.updatedCustomer,
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการแลกของรางวัล' }, { status: 500 });
  }
}
