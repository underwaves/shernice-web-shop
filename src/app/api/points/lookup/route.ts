import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface SafeOrder {
  queueNumber: string;
  heroName: string;
  skinName: string;
  status: string;
  slipApproved: boolean;
  hasSlip: boolean;
}

interface SafeTransaction {
  id: number;
  amount: number;
  type: string;
  reason: string;
  createdAt: Date;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const query = typeof body.q === 'string' ? body.q.trim() : '';
    const contactId = typeof body.contactId === 'string' ? body.contactId.trim() : '';
    const contactPlatform = typeof body.contactPlatform === 'string' ? body.contactPlatform.trim() : '';

    if (!query || !contactId || !['Line', 'Facebook', 'Instagram', 'Discord'].includes(contactPlatform)) {
      return NextResponse.json(
        { error: 'กรุณากรอกชื่อหรือเลขคิว พร้อม ID ช่องทางติดต่อที่ใช้สั่งงาน' },
        { status: 400 }
      );
    }

    const isQueuePattern = /^SN\d+$/i.test(query);

    let customer: any = null;
    let matchingOrder: any = null;

    if (isQueuePattern) {
      // 1. Queue number search: Strictly match exact queue number
      matchingOrder = await prisma.order.findUnique({
        where: { queueNumber: query.toUpperCase() },
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

      if (matchingOrder?.contactId !== contactId || matchingOrder?.contactPlatform !== contactPlatform) matchingOrder = null;
      if (matchingOrder) {
        if (matchingOrder.customer) {
          customer = matchingOrder.customer;
        } else {
          customer = await prisma.customer.findFirst({
            where: { name: matchingOrder.customerName, contactId, contactPlatform },
            include: {
              pointTransactions: {
                orderBy: { createdAt: 'desc' },
              },
            },
          });
        }
      }
    } else {
      // 2. Name search: Match EXACT name only (prevent partial substring leak)
      customer = await prisma.customer.findFirst({
        where: { name: { equals: query }, contactId, contactPlatform },
        include: {
          pointTransactions: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      // Fallback: If customer record wasn't created yet, check order with exact customer name
      if (!customer) {
        matchingOrder = await prisma.order.findFirst({
          where: { customerName: { equals: query }, contactId, contactPlatform },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    if (!customer && !matchingOrder) {
      return NextResponse.json(
        { error: 'ไม่พบข้อมูลลูกค้าหรือเลขคิวที่ระบุ กรุณาตรวจสอบความถูกต้อง' },
        { status: 404 }
      );
    }

    const customerName = customer?.name || matchingOrder?.customerName || '';
    const customerId = customer?.id || null;

    // Check review eligibility without exposing review text or personal details
    const reviewConditions: any[] = [];
    if (customerId) {
      reviewConditions.push({ customerId });
    }
    if (matchingOrder?.queueNumber) {
      reviewConditions.push({ queueNumber: matchingOrder.queueNumber });
    }

    const approvedReview = reviewConditions.length > 0
      ? await prisma.review.findFirst({
          where: {
            status: 'APPROVED',
            OR: reviewConditions,
          },
          select: { id: true },
        })
      : null;

    // Build order conditions cleanly without empty objects
    const orderConditions: any[] = [];
    if (isQueuePattern && matchingOrder) {
      // When queried by queue number, strictly limit scope to that specific order
      orderConditions.push({ id: matchingOrder.id });
    } else if (customerId) {
      orderConditions.push({ customerId });
    } else if (customerName) {
      orderConditions.push({ customerName });
    } else if (matchingOrder?.id) {
      orderConditions.push({ id: matchingOrder.id });
    }

    // Sanitize customer orders: Only return fields needed by points status view
    // NEVER expose slipUrl, slipHash, contactId, contactPlatform, brief details or prices
    let sanitizedOrders: SafeOrder[] = [];
    if (orderConditions.length > 0) {
      const rawOrders = await prisma.order.findMany({
        where: {
          OR: orderConditions,
        },
        select: {
          id: true,
          queueNumber: true,
          heroName: true,
          skinName: true,
          status: true,
          slipApproved: true,
          slipUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      sanitizedOrders = rawOrders.map((ord) => ({
        queueNumber: ord.queueNumber,
        heroName: ord.heroName,
        skinName: ord.skinName,
        status: ord.status,
        slipApproved: ord.slipApproved,
        hasSlip: Boolean(ord.slipUrl),
      }));
    }

    // Sanitize point ledger transactions (omit internal keys)
    const rawTransactions = customer?.pointTransactions || [];
    const allTransactions: SafeTransaction[] = rawTransactions.map((tx: any) => ({
      id: tx.id,
      amount: tx.amount,
      type: tx.type,
      reason: tx.reason,
      createdAt: tx.createdAt,
    }));

    const earnedHistory = allTransactions.filter(
      (tx: SafeTransaction) => tx.type === 'EARNED' || (tx.type === 'ADJUSTED' && tx.amount > 0)
    );
    const redeemedHistory = allTransactions.filter(
      (tx: SafeTransaction) => tx.type === 'REDEEMED' || (tx.type === 'ADJUSTED' && tx.amount < 0)
    );

    // Never expose the internal customer ID or contact details. Redemption uses
    // a queue number plus the verified contact ID instead.
    const sanitizedCustomer = {
      name: customerName,
      pointsBalance: customer?.pointsBalance || 0,
    };

    return NextResponse.json({
      customer: sanitizedCustomer,
      customerOrders: sanitizedOrders,
      hasApprovedReview: Boolean(approvedReview),
      earnedHistory,
      redeemedHistory,
      allTransactions,
      targetPoints: 10,
    });
  } catch (error) {
    console.error('Error in points lookup:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจสอบแต้ม' },
      { status: 500 }
    );
  }
}
