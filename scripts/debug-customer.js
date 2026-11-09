const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const customers = await prisma.customer.findMany({
    include: { orders: true, pointTransactions: true, reviews: true },
  });
  console.log('--- ALL CUSTOMERS ---');
  console.log(JSON.stringify(customers, null, 2));

  const orders = await prisma.order.findMany();
  console.log('--- ALL ORDERS ---');
  console.log(JSON.stringify(orders, null, 2));

  const reviews = await prisma.review.findMany();
  console.log('--- ALL REVIEWS ---');
  console.log(JSON.stringify(reviews, null, 2));
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
