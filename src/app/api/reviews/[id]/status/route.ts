import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';
import { awardPendingPointsOnReviewApproved } from '@/lib/points';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    const { status } = await request.json();

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'สถานะไม่ถูกต้อง' }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id },
      data: {
        status,
        approvedAt: status === 'APPROVED' ? new Date() : null,
      },
    });

    if (status === 'APPROVED') {
      // Award any pending points on orders by this customer!
      await awardPendingPointsOnReviewApproved(review.id);
    }

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_REVIEW_STATUS',
        details: `Updated review ID ${id} (Customer: ${review.customerName}) to ${status}`,
      },
    });

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
  }
}
