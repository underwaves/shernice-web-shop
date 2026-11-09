import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getNextQueueNumber } from '@/lib/queue';
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
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { queueNumber: { contains: search } },
        { customerName: { contains: search } },
        { contactId: { contains: search } },
        { heroName: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error listing orders:', error);
    return NextResponse.json({ error: 'Failed to list orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const briefType = body.briefType || 'FORM_A';

    // Validation for Form A
    if (briefType === 'FORM_A') {
      if (!body.customerName?.trim()) {
        return NextResponse.json({ error: 'กรุณากรอกชื่อลูกค้า' }, { status: 400 });
      }
      if (!body.contactPlatform || !body.contactId?.trim()) {
        return NextResponse.json({ error: 'กรุณาระบุช่องทางการติดต่อและ ID' }, { status: 400 });
      }
      if (!body.inGameName?.trim()) {
        return NextResponse.json({ error: 'กรุณากรอกชื่อในเกมส์' }, { status: 400 });
      }
      if (!body.heroName?.trim()) {
        return NextResponse.json({ error: 'กรุณากรอกฮีโร่ / Hero' }, { status: 400 });
      }
      if (!body.skinName?.trim()) {
        return NextResponse.json({ error: 'กรุณากรอกสกิน / Skin' }, { status: 400 });
      }
      if (!body.rank?.trim()) {
        return NextResponse.json({ error: 'กรุณาระบุแรงค์ (เช่น คอนกี่ดาว หรือกลออันดับที่เท่าไหร่)' }, { status: 400 });
      }
      if (!body.skinLevel) {
        return NextResponse.json({ error: 'กรุณาเลือกระดับสกิน (เก่า / ใหม่)' }, { status: 400 });
      }
      if (!body.badgeType || !body.badgeValue) {
        return NextResponse.json({ error: 'กรุณาเลือกโล่หรือเม็ด' }, { status: 400 });
      }
    }

    // Atomic Queue generation: continuous forever, unique even under deletion, concurrency safe
    const queueNumber = await getNextQueueNumber();
    const transferNote = `${queueNumber} ${body.customerName?.trim() || 'ลูกค้า'}`;

    // Calculate total price from selected items
    const items = Array.isArray(body.items) ? body.items : [];
    let totalPrice = 0;
    if (items.length > 0) {
      totalPrice = items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1), 0);
    } else if (body.totalPrice) {
      totalPrice = parseFloat(body.totalPrice);
    }

    // Create or find customer
    let customerId: number | undefined;
    if (body.customerName && body.contactPlatform && body.contactId) {
      const customer = await prisma.customer.upsert({
        where: {
          name_contactPlatform_contactId: {
            name: body.customerName.trim(),
            contactPlatform: body.contactPlatform,
            contactId: body.contactId.trim(),
          },
        },
        update: {},
        create: {
          name: body.customerName.trim(),
          contactPlatform: body.contactPlatform,
          contactId: body.contactId.trim(),
          pointsBalance: 0,
        },
      });
      customerId = customer.id;
    }

    const order = await prisma.order.create({
      data: {
        queueNumber,
        customerName: body.customerName.trim(),
        contactPlatform: body.contactPlatform,
        contactId: body.contactId.trim(),
        inGameName: body.inGameName?.trim() || '',
        heroName: body.heroName?.trim() || '',
        skinName: body.skinName?.trim() || '',
        rank: body.rank?.trim() || '',
        skinLevel: body.skinLevel || 'ใหม่',
        badgeType: body.badgeType || 'โล่',
        badgeValue: body.badgeValue || 'โล่เริ่มต้น',
        powerTrait: body.powerTrait?.trim() || '',
        additionalBrief: body.additionalBrief?.trim() || '',
        briefType,
        formBDataJson: body.formBData ? JSON.stringify(body.formBData) : null,
        itemsJson: JSON.stringify(items),
        totalPrice,
        status: 'รอชำระเงิน',
        transferNote,
        customerId,
      },
    });

    return NextResponse.json({
      success: true,
      order,
      queueNumber,
      transferNote,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างออเดอร์ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
