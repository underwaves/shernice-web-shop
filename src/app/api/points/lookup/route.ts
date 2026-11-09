import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json({ error: 'กรุณากรอกชื่อหรือเลขคิวเพื่อค้นหาแต้มสะสม' }, { status: 400 });
    }

    // Try finding by queue number first
    let customer: any = null;
    let matchingOrder: any = null;

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { queueNumber: { equals: query } },
          { queueNumber: { equals: query.toUpperCase() } },
        ],
      },
      include: {
        customer: {
          include: {
            pointTransactions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    });

    if (order) {
      matchingOrder = order;
      if (order.customer) {
        customer = order.customer;
      } else {
        customer = await prisma.customer.findFirst({
          where: { name: order.customerName },
          include: {
            pointTransactions: {
              orderBy: { createdAt: 'desc' },
            },
          },
        });
      }
    }

    if (!customer) {
      customer = await prisma.customer.findFirst({
        where: {
          OR: [
            { name: { equals: query } },
            { name: { contains: query } },
            { contactId: { equals: query } },
          ],
        },
        include: {
          pointTransactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    }

    if (!customer && !matchingOrder) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลลูกค้าหรือเลขคิวที่ระบุ กรุณาตรวจสอบความถูกต้อง' },
        { status: 404 }
      );
    }

    // Check if customer has approved review
    const hasApprovedReview = customer
      ? await prisma.review.findFirst({
          where: {
            status: 'APPROVED',
            OR: [
              { customerId: customer.id },
              { customerName: customer.name },
              { contactId: customer.contactId },
            ],
          },
        })
      : null;

    // Fetch customer's orders to explain point eligibility/orders status
    const customerOrders = await prisma.order.findMany({
      where: {
        OR: [
          customer?.id ? { customerId: customer.id } : {},
          customer?.name ? { customerName: customer.name } : {},
          matchingOrder?.id ? { id: matchingOrder.id } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const earnedHistory = (customer?.pointTransactions || []).filter((tx: any) => tx.type === 'EARNED' || (tx.type === 'ADJUSTED' && tx.amount > 0));
    const redeemedHistory = (customer?.pointTransactions || []).filter((tx: any) => tx.type === 'REDEEMED' || (tx.type === 'ADJUSTED' && tx.amount < 0));

    return NextResponse.json({
      customer: customer || {
        id: null,
        name: matchingOrder.customerName,
        pointsBalance: 0,
      },
      order: matchingOrder,
      customerOrders,
      hasApprovedReview: !!hasApprovedReview,
      earnedHistory,
      redeemedHistory,
      allTransactions: customer?.pointTransactions || [],
      targetPoints: 10,
    });
  } catch (error) {
    console.error('Error in points lookup:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการตรวจสอบแต้ม' }, { status: 500 });
  }
}
