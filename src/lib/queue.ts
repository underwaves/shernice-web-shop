import prisma from './prisma';

/**
 * Generates continuous, unique queue numbers safe under concurrency.
 * Format: "SN" + zero-padded 3 digits (SN001, SN002... SN999, SN1000...).
 * Sequence is continuous forever, never resets daily, and uses atomic counter.
 */
export async function getNextQueueNumber(): Promise<string> {
  const counter = await prisma.$transaction(async (tx) => {
    const updated = await tx.queueCounter.update({
      where: { id: 1 },
      data: {
        lastNumber: {
          increment: 1,
        },
      },
    });
    return updated;
  });

  const num = counter.lastNumber;
  const padded = num < 1000 ? String(num).padStart(3, '0') : String(num);
  return `${counter.prefix || 'SN'}${padded}`;
}
