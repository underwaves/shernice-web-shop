const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Queue Counter
  await prisma.queueCounter.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      lastNumber: 0,
      prefix: 'SN',
    },
  });

  // 2. Settings
  const initialCode = process.env.ADMIN_INITIAL_CODE || '2247';
  const initialPasswordHash = bcrypt.hashSync(initialCode, 10);
  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      shopName: 'Shernice',
      bio: 'ยินดีต้อนรับเข้าสู่ร้านของเชอไน้ สนใจบริการตัดรูปแบบใดสามารถเลือก และสอบถามเพิ่มเติมได้นะคะ',
      avatarUrl: '/images/avatar.gif',
      coverUrl: '/images/cover.gif',
      driveLink: 'https://drive.google.com',
      statusLink: '/queue',
      contactLink: 'https://line.me/ti/p/@832rjuhx',
      lineId: '@832rjuhx',
      bgMusicUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      bgMusicEnabled: true,
      primaryColor: '#fb7185',
      secondaryColor: '#fda4af',
      accentColor: '#c084fc',
      bgColor: '#fff5f7',
      cardColor: '#ffffff',
      promptpayName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
      promptpayQrUrl: '/images/promptpay-qr.png',
      kbankName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
      kbankCardUrl: '/images/kbank-card.png',
      truemoneyName: 'น.ส.ปิ่นจุฑา ฟุ้งสกุล',
      truemoneyNumber: '096-269-4483',
      truemoneyFee: 2.0,
      adminPasswordHash: initialPasswordHash,
      rewardsDescription: 'เมื่อสะสมครบตามเงื่อนไข สามารถเลือกของรางวัลได้',
      rewardsListJson: JSON.stringify(['ส่วนลด STK', 'นฟ', 'CP', 'DM']),
      notes: 'สงวนสิทธิ์ให้เฉพาะลูกค้าที่รีวิวให้กับทางร้านเท่านั้น หากสะสมครบมีรางวัลสุดพิเศษให้เลือกเย้อมากก',
    },
  });

  // 3. Products
  const products = [
    {
      code: '1.1',
      name: '1.1 ตัดกรอบใส (Clear Frame)',
      price: 10,
      description: 'ตัดขอบกรอบใสตัวละคร ROV คมชัดระดับ Full HD เก็บขอบเนียนกริบ ไฟล์ PNG พื้นหลังโปร่งใส นำไปแต่งรูปต่อได้ง่าย',
      footnote: null,
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 1,
    },
    {
      code: '1.2',
      name: '1.2 ตัดหน้าโหลด (Loading)',
      price: 15,
      description: 'ตัดรูปหน้าโหลดสกิน ROV สวยเด่น ชัดเจนทุกมิติ ครบทั้งกรอบและดีเทลตัวละครสุดเท่',
      footnote: null,
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 2,
    },
    {
      code: '1.3',
      name: '1.3 ตัดรูปหน้าโหลดใส่พื้นหลัง*',
      price: 5,
      description: 'ใส่พื้นหลังลวดลายน่ารัก มินิมอล หรือธีมเท่ๆ สำหรับลูกค้าที่มีไฟล์กรอบใสหรือหน้าโหลดอยู่แล้ว',
      footnote: '*1.3 สำหรับลูกค้าที่มีหน้าโหลดหรือกรอบใสอยู่แล้ว',
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 3,
    },
    {
      code: '1.4',
      name: '1.4 ตัดรูปหน้าโหลดมีพื้นหลัง*',
      price: 20,
      description: 'บริการครบวงจร ตัดหน้าโหลดสกิน ROV พร้อมจัดทำพื้นหลังสุดพรีเมียม สำหรับลูกค้าที่มีเพียงชื่อสกิน',
      footnote: '*1.4 สำหรับลูกค้าที่มีเพียงชื่อ ไม่มีหน้าโหลดหรือกรอบใส',
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 4,
    },
    {
      code: '1.5',
      name: '1.5 ตัดรูปหน้าโหลดกรอบทะลุ (ต่อ 1 คน)',
      price: 10,
      description: 'แต่งรูปเทคนิคพิเศษ กรอบทะลุ 3D ตัวละครลอยเด่นทะลุมิติ สไตล์ไม่ซ้ำใคร',
      footnote: null,
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 5,
    },
    {
      code: '1.6',
      name: '1.6 ตัดรูปโชว์ Winrate ตัวละคร',
      price: 5,
      description: 'ตัดเฉพาะส่วนสถิติ Winrate อัตราชนะ และจำนวนเกมที่เล่น ไฮไลท์ผลงานตัวตึง',
      footnote: null,
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 6,
    },
    {
      code: '1.7',
      name: '1.7 ชื่อ PNG',
      price: 2,
      description: 'ตัดชื่อตัวละคร หรือชื่อในเกมเป็นไฟล์ PNG โปร่งใส คมชัด ใช้แปะแต่งรูปหรือคลิปได้ทันที',
      footnote: null,
      briefType: 'FORM_A',
      exampleImagesJson: JSON.stringify([
        'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=60',
      ]),
      displayOrder: 7,
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { code: p.code },
      update: {
        name: p.name,
        price: p.price,
        description: p.description,
        footnote: p.footnote,
        exampleImagesJson: p.exampleImagesJson,
        displayOrder: p.displayOrder,
      },
      create: p,
    });
  }

  // 4. Sample initial approved review for demonstration
  const existingReview = await prisma.review.findFirst();
  if (!existingReview) {
    await prisma.review.create({
      data: {
        customerName: 'คุณมิว',
        contactPlatform: 'Line',
        contactId: 'mew_rov',
        queueNumber: 'SN000',
        rating: 5,
        comment: 'งานไวมากค่ะ ตัดเนียนกริบ สวยตามที่บรีฟเป๊ะๆ แนะนำร้านนี้เลยยยย 💖',
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });
  }

  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
