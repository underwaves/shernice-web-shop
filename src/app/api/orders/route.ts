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

    // Calculate total price from selected items
    const requestedItems = Array.isArray(body.items) ? body.items : [];
    if (requestedItems.length > 0) {
      const codes: string[] = Array.from(new Set<string>(requestedItems.map((item: any) => String(item?.code || ''))));
      const products = await prisma.product.findMany({
        where: { code: { in: codes }, active: true },
      });
      const productsByCode = new Map(products.map((product) => [product.code, product]));

      if (productsByCode.size !== codes.length) {
        return NextResponse.json({ error: 'มีสินค้าที่ไม่พร้อมให้บริการ กรุณาโหลดหน้าเว็บใหม่' }, { status: 400 });
      }

      for (const item of requestedItems) {
        const quantity = Number(item?.quantity ?? 1);
        if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
          return NextResponse.json({ error: 'จำนวนสินค้าไม่ถูกต้อง' }, { status: 400 });
        }
      }

      const items = requestedItems.map((item: any) => {
        const product = productsByCode.get(String(item.code))!;
        return {
          code: product.code,
          name: product.name,
          price: product.price,
          quantity: Number(item.quantity ?? 1),
        };
      });
      const totalPrice = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

      return await createOrder(body, briefType, items, totalPrice);
    }

    return await createOrder(body, briefType, [], 0);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างออเดอร์ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}

async function createOrder(body: any, briefType: string, items: any[], totalPrice: number) {
  try {
    // Only allocate a queue after validating the product list and authoritative prices.
    const queueNumber = await getNextQueueNumber();
    const transferNote = `${queueNumber} ${body.customerName?.trim() || 'ลูกค้า'}`;

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
      totalPrice,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการสร้างออเดอร์ กรุณาลองใหม่อีกครั้ง' }, { status: 500 });
  }
}
