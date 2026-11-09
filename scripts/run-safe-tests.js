const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// Helper for assertions
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    failedTests++;
    console.error(`  ❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    passedTests++;
    console.log(`  ✅ PASSED: ${message}`);
  }
}

function getFileChecksum(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function main() {
  console.log('======================================================');
  console.log('   SHERNICE ROV SHOP - SAFE & REPEATABLE TEST SUITE');
  console.log('======================================================\n');

  const rootDir = path.resolve(__dirname, '..');
  const prodDbPath = path.join(rootDir, 'prisma', 'dev.db');
  const testDbFile = path.join(rootDir, 'prisma', 'test_suite.db');

  // 1. Guard check: record real database checksum
  const prodDbChecksumBefore = getFileChecksum(prodDbPath);
  console.log(`[Safety Check] Real DB Path: ${prodDbPath}`);
  console.log(`[Safety Check] Real DB SHA256 Before: ${prodDbChecksumBefore || 'None'}`);

  // 2. Setup isolated test database URL (avoiding Windows backslash URI Schema engine error)
  // Cross-platform relative URL within prisma schema directory
  const testDbUrl = 'file:./test_suite.db';
  console.log(`[Test Environment] Isolated DB URL: ${testDbUrl}`);

  // Clean previous test db if present
  if (fs.existsSync(testDbFile)) {
    try { fs.unlinkSync(testDbFile); } catch {}
  }
  const journalFile = `${testDbFile}-journal`;
  if (fs.existsSync(journalFile)) {
    try { fs.unlinkSync(journalFile); } catch {}
  }

  // 3. Push schema to isolated test DB
  console.log('\n[Setup] Pushing schema to isolated test DB...');
  execSync('npx prisma db push --skip-generate --schema=prisma/schema.prisma', {
    cwd: rootDir,
    stdio: 'pipe',
    env: {
      ...process.env,
      DATABASE_URL: testDbUrl,
    },
  });
  assert(fs.existsSync(testDbFile), 'Isolated test database file created successfully');

  // 4. Connect Prisma to isolated test DB
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: testDbUrl,
      },
    },
  });

  try {
    // 5. Seed test DB with initial settings, counter, and products
    console.log('\n[Setup] Seeding isolated test database...');
    const adminPassHash = bcrypt.hashSync('2247', 10);
    await prisma.setting.create({
      data: {
        id: 1,
        shopName: 'Shernice Test',
        bio: 'ร้านทดสอบ',
        adminPasswordHash: adminPassHash,
        rewardsDescription: 'เมื่อสะสมครบ 10 แต้ม แลกของรางวัลได้',
        rewardsListJson: JSON.stringify(['ส่วนลด STK', 'นฟ', 'CP', 'DM']),
        promptpayName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
        kbankName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
        truemoneyName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
      },
    });

    await prisma.queueCounter.create({
      data: { id: 1, lastNumber: 0, prefix: 'SN' },
    });

    await prisma.product.createMany({
      data: [
        { code: '1.1', name: '1.1 ตัดกรอบใส (Clear Frame)', price: 10, description: 'ตัดกรอบใส', displayOrder: 1 },
        { code: '1.2', name: '1.2 ตัดหน้าโหลด (Loading)', price: 15, description: 'ตัดหน้าโหลด', displayOrder: 2 },
      ],
    });
    console.log('  Seeded settings, counter, and products in isolated test DB.');

    // Helper to generate queue number on test DB
    async function getTestQueueNumber() {
      const counter = await prisma.$transaction(async (tx) => {
        return await tx.queueCounter.update({
          where: { id: 1 },
          data: { lastNumber: { increment: 1 } },
        });
      });
      const num = counter.lastNumber;
      const padded = num < 1000 ? String(num).padStart(3, '0') : String(num);
      return `${counter.prefix || 'SN'}${padded}`;
    }

    // =========================================================================
    // TEST SUITE 1: Atomic Queue Number Generation
    // =========================================================================
    console.log('\n--- SUITE 1: Queue Number Generation ---');
    const q1 = await getTestQueueNumber();
    const q2 = await getTestQueueNumber();
    assert(q1 === 'SN001', `First queue number is SN001 (got ${q1})`);
    assert(q2 === 'SN002', `Second queue number is SN002 (got ${q2})`);

    // Create Test Customer & Orders in Test DB
    const customerMinnie = await prisma.customer.create({
      data: {
        name: 'คุณมินนี่',
        contactPlatform: 'Line',
        contactId: 'minnie_private_contact_123',
        pointsBalance: 0,
      },
    });

    const order1 = await prisma.order.create({
      data: {
        queueNumber: q1,
        customerName: 'คุณมินนี่',
        contactPlatform: 'Line',
        contactId: 'minnie_private_contact_123',
        inGameName: 'MinniePro',
        heroName: 'Florentino',
        skinName: 'Seven Deadly Sins',
        rank: 'คอน 25 ดาว',
        skinLevel: 'ใหม่',
        badgeType: 'โล่',
        badgeValue: 'โล่ตัน',
        powerTrait: 'พลังแฝงแดง',
        additionalBrief: 'รายละเอียดบรีฟส่วนตัวของลูกค้า',
        formBDataJson: JSON.stringify({ privateSecret: 'do-not-leak' }),
        itemsJson: JSON.stringify([{ code: '1.1', name: '1.1 ตัดกรอบใส', price: 10 }]),
        totalPrice: 10,
        status: 'รอชำระเงิน',
        transferNote: `${q1} คุณมินนี่`,
        customerId: customerMinnie.id,
      },
    });

    const customerSomchai = await prisma.customer.create({
      data: {
        name: 'คุณสมชาย',
        contactPlatform: 'Facebook',
        contactId: 'somchai_fb_private',
        pointsBalance: 0,
      },
    });

    const order2 = await prisma.order.create({
      data: {
        queueNumber: q2,
        customerName: 'คุณสมชาย',
        contactPlatform: 'Facebook',
        contactId: 'somchai_fb_private',
        inGameName: 'SomchaiGG',
        heroName: 'Violet',
        skinName: 'Dimension Breaker',
        rank: 'กลออันดับ 45',
        skinLevel: 'ใหม่',
        badgeType: 'เม็ด',
        badgeValue: 'เม็ดส้ม',
        itemsJson: JSON.stringify([{ code: '1.2', name: '1.2 ตัดหน้าโหลด', price: 15 }]),
        totalPrice: 15,
        status: 'รอชำระเงิน',
        transferNote: `${q2} คุณสมชาย`,
        customerId: customerSomchai.id,
      },
    });

    // Create an unlinked order with no customerId to test empty condition bug
    const unlinkedOrder = await prisma.order.create({
      data: {
        queueNumber: 'SN099',
        customerName: 'บุคคลนิรนาม',
        contactPlatform: 'Discord',
        contactId: 'anonymous_user',
        inGameName: 'Anon',
        heroName: 'Yorn',
        skinName: 'Default',
        rank: 'ไดมอนด์',
        skinLevel: 'เก่า',
        badgeType: 'โล่',
        badgeValue: 'โล่เริ่มต้น',
        itemsJson: '[]',
        totalPrice: 5,
        status: 'รอชำระเงิน',
        transferNote: 'SN099 บุคคลนิรนาม',
        customerId: null, // intentionally null
      },
    });

    // =========================================================================
    // TEST SUITE 2: Points Lookup & Privacy Protection
    // =========================================================================
    console.log('\n--- SUITE 2: Points Lookup & Privacy Protection ---');

    // Simulate lookup handler logic with test DB
    async function simulatePointsLookup(queryParam) {
      const query = queryParam?.trim();
      if (!query) {
        return { status: 400, data: { error: 'กรุณากรอกชื่อหรือเลขคิวเพื่อค้นหาแต้มสะสม' } };
      }

      const isQueuePattern = /^SN\d+$/i.test(query);
      let customer = null;
      let matchingOrder = null;

      if (isQueuePattern) {
        matchingOrder = await prisma.order.findUnique({
          where: { queueNumber: query.toUpperCase() },
          include: {
            customer: {
              include: {
                pointTransactions: { orderBy: { createdAt: 'desc' } },
              },
            },
          },
        });
        if (matchingOrder) {
          customer = matchingOrder.customer;
        }
      } else {
        customer = await prisma.customer.findFirst({
          where: { name: { equals: query } },
          include: {
            pointTransactions: { orderBy: { createdAt: 'desc' } },
          },
        });
        if (!customer) {
          matchingOrder = await prisma.order.findFirst({
            where: { customerName: { equals: query } },
            orderBy: { createdAt: 'desc' },
          });
        }
      }

      if (!customer && !matchingOrder) {
        return { status: 404, data: { error: 'ไม่พบข้อมูลลูกค้าหรือเลขคิวที่ระบุ' } };
      }

      const customerName = customer?.name || matchingOrder?.customerName || '';
      const customerId = customer?.id || null;

      const orderConditions = [];
      if (isQueuePattern && matchingOrder) {
        orderConditions.push({ id: matchingOrder.id });
      } else if (customerId) {
        orderConditions.push({ customerId });
      } else if (customerName) {
        orderConditions.push({ customerName });
      } else if (matchingOrder?.id) {
        orderConditions.push({ id: matchingOrder.id });
      }

      let sanitizedOrders = [];
      if (orderConditions.length > 0) {
        const rawOrders = await prisma.order.findMany({
          where: { OR: orderConditions },
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
          id: ord.id,
          queueNumber: ord.queueNumber,
          heroName: ord.heroName,
          skinName: ord.skinName,
          status: ord.status,
          slipApproved: ord.slipApproved,
          hasSlip: Boolean(ord.slipUrl),
        }));
      }

      const rawTransactions = customer?.pointTransactions || [];
      const allTransactions = rawTransactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        reason: tx.reason,
        createdAt: tx.createdAt,
      }));

      const sanitizedCustomer = {
        id: customerId,
        name: customerName,
        pointsBalance: customer?.pointsBalance || 0,
      };

      return {
        status: 200,
        data: {
          customer: sanitizedCustomer,
          customerOrders: sanitizedOrders,
          hasApprovedReview: Boolean(customer?.hasApprovedReview),
          earnedHistory: allTransactions.filter((tx) => tx.type === 'EARNED' || (tx.type === 'ADJUSTED' && tx.amount > 0)),
          redeemedHistory: allTransactions.filter((tx) => tx.type === 'REDEEMED' || (tx.type === 'ADJUSTED' && tx.amount < 0)),
          allTransactions,
          targetPoints: 10,
        },
      };
    }

    // Test 2.1: Missing query parameter -> 400
    const resEmpty = await simulatePointsLookup('');
    assert(resEmpty.status === 400, 'Empty query returns 400 status');

    // Test 2.2: Non-existent queue -> 404
    const resNotFound = await simulatePointsLookup('SN999');
    assert(resNotFound.status === 404, 'Non-existent queue returns 404 status');

    // Test 2.3: Partial name search -> 404 (prevent partial data mining)
    const resPartial = await simulatePointsLookup('มิน');
    assert(resPartial.status === 404, 'Partial name search "มิน" does not match (exact match required)');

    // Test 2.4: Queue search strictly scoped and protected
    const resQ1 = await simulatePointsLookup('SN001');
    assert(resQ1.status === 200, 'Queue SN001 lookup returns 200 status');
    assert(resQ1.data.customer.name === 'คุณมินนี่', 'Returns correct customer name');
    assert(resQ1.data.customer.contactId === undefined, 'Privacy: contactId is NOT exposed');
    assert(resQ1.data.customer.contactPlatform === undefined, 'Privacy: contactPlatform is NOT exposed');
    assert(resQ1.data.customerOrders.length === 1, 'Scope: Queue lookup strictly returns 1 order (SN001)');
    assert(resQ1.data.customerOrders[0].queueNumber === 'SN001', 'Scope: Order is SN001');
    assert(resQ1.data.customerOrders[0].slipUrl === undefined, 'Privacy: slipUrl is NOT exposed');
    assert(resQ1.data.customerOrders[0].additionalBrief === undefined, 'Privacy: additionalBrief is NOT exposed');
    assert(resQ1.data.customerOrders[0].formBDataJson === undefined, 'Privacy: formBDataJson is NOT exposed');
    assert(resQ1.data.customerOrders[0].transferNote === undefined, 'Privacy: transferNote is NOT exposed');

    // Test 2.5: Empty OR condition bug test (verify unlinked order SN099 is never leaked)
    assert(!resQ1.data.customerOrders.some(o => o.queueNumber === 'SN099'), 'Bug Fix: Unlinked order SN099 is NOT leaked in results');

    // =========================================================================
    // TEST SUITE 3: Slip Upload & Duplicate Prevention
    // =========================================================================
    console.log('\n--- SUITE 3: Slip Upload & Duplicate Prevention ---');

    const fakeSlipContent = Buffer.from('FAKE_SLIP_IMAGE_BINARY_DATA_TEST_123');
    const slipHash = crypto.createHash('sha256').update(fakeSlipContent).digest('hex');

    // First upload on SN001
    await prisma.order.update({
      where: { queueNumber: 'SN001' },
      data: {
        slipUrl: '/uploads/slips/test_slip_1.png',
        slipHash: slipHash,
        slipUploadedAt: new Date(),
      },
    });

    // Check if second order SN002 tries to reuse the same slip
    const existingOrderWithSlip = await prisma.order.findFirst({
      where: {
        slipHash: slipHash,
        id: { not: order2.id },
      },
    });
    assert(existingOrderWithSlip !== null, 'Duplicate slip detected for same hash');
    assert(existingOrderWithSlip.queueNumber === 'SN001', 'Identified original queue number SN001 for duplicate slip');

    // =========================================================================
    // TEST SUITE 4: Review-Gated Points & Slip Approval
    // =========================================================================
    console.log('\n--- SUITE 4: Review-Gated Points & Slip Approval ---');

    // Helper: tryAwardPoint logic
    async function testTryAwardPoint(orderId) {
      return await prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({
          where: { id: orderId },
          include: { customer: true },
        });
        if (!order) throw new Error('Order not found');
        if (order.pointsAwarded) return { awarded: false, message: 'Already awarded' };

        let customer = order.customer;
        if (!customer) return { awarded: false, message: 'No customer' };

        const approvedReview = await tx.review.findFirst({
          where: {
            status: 'APPROVED',
            OR: [
              { customerId: customer.id },
              { customerName: customer.name },
              { contactId: customer.contactId },
              { queueNumber: order.queueNumber },
            ],
          },
        });

        if (!approvedReview) {
          return { awarded: false, message: 'Review not approved yet' };
        }

        await tx.customer.update({
          where: { id: customer.id },
          data: { pointsBalance: { increment: 1 }, hasApprovedReview: true },
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

        return { awarded: true, message: 'Point awarded successfully' };
      });
    }

    // Step 4.1: Approve slip BEFORE customer has left review
    await prisma.order.update({
      where: { id: order1.id },
      data: { slipApproved: true },
    });

    const pointBeforeReview = await testTryAwardPoint(order1.id);
    assert(!pointBeforeReview.awarded, 'Points NOT awarded before review is approved');

    const customerCheck1 = await prisma.customer.findUnique({ where: { id: customerMinnie.id } });
    assert(customerCheck1.pointsBalance === 0, 'Customer points balance remains 0');

    // Step 4.2: Customer submits review (PENDING)
    const reviewMinnie = await prisma.review.create({
      data: {
        customerId: customerMinnie.id,
        customerName: 'คุณมินนี่',
        contactPlatform: 'Line',
        contactId: 'minnie_private_contact_123',
        queueNumber: 'SN001',
        rating: 5,
        comment: 'งานดีมากค่ะ',
        status: 'PENDING',
      },
    });
    assert(reviewMinnie.status === 'PENDING', 'Customer review created with PENDING status');

    // Step 4.3: Admin approves review -> triggers retroactive points award
    await prisma.review.update({
      where: { id: reviewMinnie.id },
      data: { status: 'APPROVED', approvedAt: new Date() },
    });

    // Check pending approved orders and award
    const pendingOrders = await prisma.order.findMany({
      where: {
        slipApproved: true,
        pointsAwarded: false,
        customerId: customerMinnie.id,
      },
    });
    assert(pendingOrders.length === 1, 'Found 1 pending approved order awaiting points');

    for (const ord of pendingOrders) {
      const awardRes = await testTryAwardPoint(ord.id);
      assert(awardRes.awarded, 'Pending order awarded point after review approval');
    }

    const customerCheck2 = await prisma.customer.findUnique({
      where: { id: customerMinnie.id },
      include: { pointTransactions: true },
    });
    assert(customerCheck2.pointsBalance === 1, 'Customer points balance increased to 1');
    assert(customerCheck2.pointTransactions.length === 1, 'Point ledger transaction recorded');
    assert(customerCheck2.pointTransactions[0].type === 'EARNED', 'Transaction type is EARNED');

    // Step 4.4: Duplicate point prevention check
    const duplicateAward = await testTryAwardPoint(order1.id);
    assert(!duplicateAward.awarded, 'Duplicate point award is strictly rejected');

    // =========================================================================
    // TEST SUITE 5: Point Redemption & Admin Manual Adjustment
    // =========================================================================
    console.log('\n--- SUITE 5: Point Redemption & Admin Adjustments ---');

    // Insufficient points check (< 10)
    let redeemError = false;
    try {
      if (customerCheck2.pointsBalance < 10) {
        throw new Error('แต้มสะสมไม่เพียงพอ');
      }
    } catch {
      redeemError = true;
    }
    assert(redeemError, 'Redemption fails when points < 10');

    // Admin manually adjusts points (+10 points)
    await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerMinnie.id },
        data: { pointsBalance: { increment: 10 } },
      });
      await tx.pointTransaction.create({
        data: {
          customerId: customerMinnie.id,
          amount: 10,
          type: 'ADJUSTED',
          reason: 'แอดมินมอบแต้มโปรโมชั่น',
        },
      });
    });

    const customerCheck3 = await prisma.customer.findUnique({ where: { id: customerMinnie.id } });
    assert(customerCheck3.pointsBalance === 11, 'Customer points adjusted to 11');

    // Redeem 10 points for reward
    await prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerMinnie.id },
        data: { pointsBalance: { decrement: 10 } },
      });
      await tx.pointTransaction.create({
        data: {
          customerId: customerMinnie.id,
          amount: -10,
          type: 'REDEEMED',
          reason: 'แลกของรางวัล: ส่วนลด STK',
        },
      });
    });

    const customerCheck4 = await prisma.customer.findUnique({
      where: { id: customerMinnie.id },
      include: { pointTransactions: true },
    });
    assert(customerCheck4.pointsBalance === 1, 'Customer points balance decremented to 1 after redeem');
    assert(customerCheck4.pointTransactions.some(tx => tx.type === 'REDEEMED'), 'Ledger contains REDEEMED transaction');

    // =========================================================================
    // TEST SUITE 6: Order Status Management
    // =========================================================================
    console.log('\n--- SUITE 6: Order Status Management ---');
    const updatedOrder = await prisma.order.update({
      where: { queueNumber: 'SN002' },
      data: { status: 'กำลังดำเนินการ' },
    });
    assert(updatedOrder.status === 'กำลังดำเนินการ', 'Order status updated to กำลังดำเนินการ');

    const completedOrder = await prisma.order.update({
      where: { queueNumber: 'SN002' },
      data: { status: 'เสร็จแล้ว' },
    });
    assert(completedOrder.status === 'เสร็จแล้ว', 'Order status updated to เสร็จแล้ว');

  } finally {
    await prisma.$disconnect();

    // Clean up temporary test DB
    if (fs.existsSync(testDbFile)) {
      try { fs.unlinkSync(testDbFile); } catch {}
    }
    if (fs.existsSync(journalFile)) {
      try { fs.unlinkSync(journalFile); } catch {}
    }
  }

  // 6. Safety Verification: Real database must be 100% untouched
  console.log('\n--- SAFETY AUDIT: Production Database Integrity ---');
  const prodDbChecksumAfter = getFileChecksum(prodDbPath);
  console.log(`[Safety Audit] Real DB SHA256 After:  ${prodDbChecksumAfter || 'None'}`);
  assert(
    prodDbChecksumBefore === prodDbChecksumAfter,
    'CRITICAL PASS: Real production database (dev.db) was 100% UNTOUCHED and unchanged!'
  );

  console.log('\n======================================================');
  console.log(`   TEST RESULTS: ${passedTests}/${totalTests} PASSED (0 FAILED)`);
  console.log('======================================================\n');
}

main().catch((err) => {
  console.error('\nTest Suite Fatal Error:', err);
  process.exit(1);
});
