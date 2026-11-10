import prisma from './prisma';

/**
 * Awards 1 point to customer for an approved order slip,
 * ONLY IF the customer has an approved review in the system.
 * Prevents duplicate point awards.
 */
export async function tryAwardPointForOrder(orderId: number) {
  return await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { customer: true },
    });

    if (!order) {
      throw new Error('ไม่พบข้อมูลออเดอร์');
    }

    if (order.pointsAwarded) {
      return { awarded: false, message: 'ออเดอร์นี้ได้รับแต้มสะสมไปแล้ว' };
    }

    // Ensure customer record exists
    let customer = order.customer;
    if (!customer) {
      customer = await tx.customer.upsert({
        where: {
          name_contactPlatform_contactId: {
            name: order.customerName,
            contactPlatform: order.contactPlatform,
            contactId: order.contactId,
          },
        },
        update: {},
        create: {
          name: order.customerName,
          contactPlatform: order.contactPlatform,
          contactId: order.contactId,
          pointsBalance: 0,
        },
      });

      // Link order to customer
      await tx.order.update({
        where: { id: order.id },
        data: { customerId: customer.id },
      });
    }

    // Check if customer has an approved review
    const approvedReview = await tx.review.findFirst({
      where: {
        status: 'APPROVED',
        OR: [
          { customerId: customer.id },
          { queueNumber: order.queueNumber },
        ],
      },
    });

    if (!approvedReview) {
      return {
        awarded: false,
        message: 'ลูกค้ายังไม่ได้เขียนรีวิว หรือรีวิวยังไม่ได้รับการอนุมัติ (จะได้รับแต้มอัตโนมัติเมื่อรีวิวผ่านการอนุมัติ)',
      };
    }

    // Award point
    await tx.customer.update({
      where: { id: customer.id },
      data: {
        pointsBalance: { increment: 1 },
        hasApprovedReview: true,
      },
    });

    await tx.pointTransaction.create({
      data: {
        customerId: customer.id,
        orderId: order.id,
        amount: 1,
        type: 'EARNED',
        reason: `แต้มสะสมจากออเดอร์ ${order.queueNumber}`,
      },
    });

    await tx.order.update({
      where: { id: order.id },
      data: { pointsAwarded: true },
    });

    return { awarded: true, message: `เพิ่มแต้มสะสม 1 แต้มให้กับ ${customer.name} เรียบร้อยแล้ว` };
  });
}

/**
 * When an admin approves a review, check if customer has pending approved orders and award points.
 */
export async function awardPendingPointsOnReviewApproved(reviewId: number) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) return;

  // Find customer
  const linkedOrder = review.queueNumber
    ? await prisma.order.findUnique({ where: { queueNumber: review.queueNumber } })
    : null;
  const customer = review.customerId
    ? await prisma.customer.findUnique({ where: { id: review.customerId } })
    : linkedOrder?.customerId
      ? await prisma.customer.findUnique({ where: { id: linkedOrder.customerId } })
      : null;

  if (!customer) return;

  // Find all approved orders with no points awarded
  const pendingOrders = await prisma.order.findMany({
    where: {
      slipApproved: true,
      pointsAwarded: false,
      OR: [
        { customerId: customer.id },
        review.queueNumber ? { queueNumber: review.queueNumber } : {},
      ],
    },
  });

  for (const ord of pendingOrders) {
    try {
      await tryAwardPointForOrder(ord.id);
    } catch (e) {
      console.error('Error awarding pending point for order', ord.id, e);
    }
  }
}
