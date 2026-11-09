import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const isAdmin = await isUserAdmin();
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true' && isAdmin;

    const reviews = await prisma.review.findMany({
      where: all ? {} : { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json(reviews);
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

    const rating = Math.min(5, Math.max(1, parseInt(body.rating, 10) || 5));

    // Try finding customer
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { name: body.customerName.trim() },
          body.contactId ? { contactId: body.contactId.trim() } : {},
        ],
      },
    });

    const review = await prisma.review.create({
      data: {
        customerId: customer?.id || null,
        customerName: body.customerName.trim(),
        contactPlatform: body.contactPlatform || 'Line',
        contactId: body.contactId?.trim() || '',
        queueNumber: body.queueNumber?.trim() || '',
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
