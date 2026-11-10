import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const isAdmin = await isUserAdmin();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true' && isAdmin;

    const reviews = all
      ? await prisma.review.findMany({ where: {}, orderBy: { createdAt: 'desc' }, take: 50 })
      : await prisma.review.findMany({
          where: { status: 'APPROVED' },
          select: { id: true, customerName: true, rating: true, comment: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 50,
        });

    return NextResponse.json(reviews, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.customerName?.trim() || !body.comment?.trim()) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อและข้อความรีวิว' }, { status: 400 });
    }

    const queueNumber = typeof body.queueNumber === 'string' ? body.queueNumber.trim().toUpperCase() : '';
    const contactId = typeof body.contactId === 'string' ? body.contactId.trim() : '';
    const contactPlatform = typeof body.contactPlatform === 'string' ? body.contactPlatform.trim() : '';
    if (!/^SN\d+$/.test(queueNumber) || !contactId || !['Line', 'Facebook', 'Instagram', 'Discord'].includes(contactPlatform)) {
      return NextResponse.json({ error: 'กรุณายืนยันคิวและช่องทางติดต่อก่อนส่งรีวิว' }, { status: 400 });
    }

    const order = await prisma.order.findFirst({
      where: {
        queueNumber,
        customerName: body.customerName.trim(),
        contactPlatform,
        contactId,
      },
      include: { customer: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'ข้อมูลคิว ชื่อลูกค้า หรือช่องทางติดต่อไม่ตรงกัน' }, { status: 404 });
    }

    // Check if review for this queue already exists (1 review per queue)
    const existingReview = await prisma.review.findFirst({
      where: { queueNumber },
    });
    if (existingReview) {
      if (existingReview.status === 'APPROVED') {
        return NextResponse.json(
          { error: `คิว ${queueNumber} ได้รับการอนุมัติรีวิวแล้วค่ะ (1 คิวสามารถส่งรีวิวได้ 1 ครั้ง)` },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `คิว ${queueNumber} ได้ส่งรีวิวไปแล้วค่ะ (อยู่ระหว่างรอแอดมินตรวจสอบอนุมัติ)` },
        { status: 400 }
      );
    }

    const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));

    // Try finding customer
    const customer = order.customer || await prisma.customer.findFirst({
      where: {
        name: body.customerName.trim(),
        contactPlatform,
        contactId,
      },
    });

    const review = await prisma.review.create({
      data: {
        customerId: customer?.id || null,
        customerName: body.customerName.trim(),
        contactPlatform,
        contactId,
        queueNumber,
        rating,
        comment: body.comment.trim(),
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'ส่งรีวิวเรียบร้อยแล้วค่ะ! แอดมินจะตรวจสอบและอนุมัติแต้มสะสมให้นะคะ 💖',
      review,
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการส่งรีวิว' }, { status: 500 });
  }
}
