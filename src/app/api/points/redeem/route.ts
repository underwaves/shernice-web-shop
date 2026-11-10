import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { queueNumber, contactPlatform, contactId, rewardName } = await request.json();

    if (typeof queueNumber !== 'string' || !/^SN\d+$/i.test(queueNumber.trim()) ||
        typeof contactPlatform !== 'string' || !['Line', 'Facebook', 'Instagram', 'Discord'].includes(contactPlatform) ||
        typeof contactId !== 'string' || !contactId.trim() ||
        typeof rewardName !== 'string' || !rewardName.trim()) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const setting = await prisma.setting.findUnique({ where: { id: 1 }, select: { rewardsListJson: true } });
    let rewards: string[] = [];
    try {
      rewards = JSON.parse(setting?.rewardsListJson || '[]');
    } catch {
      rewards = [];
    }
    if (!Array.isArray(rewards) || !rewards.includes(rewardName.trim())) {
      return NextResponse.json({ error: 'ไม่พบของรางวัลที่เลือก กรุณาเลือกจากรายการของร้าน' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: { queueNumber: queueNumber.trim().toUpperCase(), contactPlatform, contactId: contactId.trim() },
      include: { customer: true },
    });

    if (!order?.customer) {
      return NextResponse.json({ error: 'ไม่พบคิวที่ตรงกับ ID ช่องทางติดต่อ กรุณาตรวจสอบข้อมูล' }, { status: 404 });
    }
    const customer = order.customer;

    const approvedReview = await prisma.review.findFirst({
      where: {
        status: 'APPROVED',
        OR: [{ customerId: customer.id }, { queueNumber: order.queueNumber }],
      },
      select: { id: true },
    });
    if (!approvedReview) {
      return NextResponse.json({ error: 'ต้องมีรีวิวที่ร้านอนุมัติก่อนจึงจะแลกรางวัลได้' }, { status: 403 });
    }

    const pointsRequired = 10;
    if (customer.pointsBalance < pointsRequired) {
      return NextResponse.json(
        { error: `แต้มสะสมไม่เพียงพอ (ต้องการ ${pointsRequired} แต้ม แต่มี ${customer.pointsBalance} แต้ม)` },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const debit = await tx.customer.updateMany({
        where: { id: customer.id, pointsBalance: { gte: pointsRequired } },
        data: { pointsBalance: { decrement: pointsRequired } },
      });
      if (debit.count !== 1) throw new Error('แต้มสะสมไม่เพียงพอ กรุณาตรวจสอบยอดแต้มอีกครั้ง');

      const updatedCustomer = await tx.customer.findUniqueOrThrow({ where: { id: customer.id } });

      await tx.pointTransaction.create({
        data: {
          customerId: customer.id,
          amount: -pointsRequired,
          type: 'REDEEMED',
          reason: `แลกของรางวัล: ${rewardName.trim()}`,
        },
      });

      return { updatedCustomer };
    });

    return NextResponse.json({
      success: true,
      message: `แลกของรางวัล "${rewardName}" สำเร็จ! กรุณาแคปหน้าจอส่งให้ทางร้านใน Line นะคะ`,
      customer: {
        name: updated.updatedCustomer.name,
        pointsBalance: updated.updatedCustomer.pointsBalance,
      },
    });
  } catch (error) {
    console.error('Error redeeming points:', error);
    const message = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: message || 'เกิดข้อผิดพลาดในการแลกของรางวัล' }, { status: message.includes('แต้มสะสม') ? 400 : 500 });
  }
}
