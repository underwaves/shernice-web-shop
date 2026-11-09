async function runTests() {
  console.log('--- STARTING API TESTS ---');

  // 1. Settings
  console.log('\n[1] Testing GET /api/settings');
  const resSettings = await fetch('http://localhost:3000/api/settings');
  const settings = await resSettings.json();
  console.log('Shop Name:', settings.shopName);
  console.log('Bio:', settings.bio);
  console.log('PromptPay Name:', settings.promptpayName);

  // 2. Products
  console.log('\n[2] Testing GET /api/products');
  const resProducts = await fetch('http://localhost:3000/api/products');
  const products = await resProducts.json();
  console.log(`Fetched ${products.length} products`);
  products.forEach(p => console.log(` - ${p.code}: ${p.name} (${p.price} THB)`));

  // 3. Submit Brief (Order 1) -> Generates Queue
  console.log('\n[3] Testing POST /api/orders (Order 1)');
  const resOrder1 = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      briefType: 'FORM_A',
      customerName: 'คุณมินนี่',
      contactPlatform: 'Line',
      contactId: 'minnie_rov',
      inGameName: 'MinnieCute',
      heroName: 'Florentino',
      skinName: 'Seven Deadly Sins',
      rank: 'คอน 25 ดาว',
      skinLevel: 'ใหม่',
      badgeType: 'โล่',
      badgeValue: 'โล่ตัน',
      powerTrait: 'พลังแฝงแดง',
      additionalBrief: 'ขอแบบคมๆ ขอบเนียนๆ ค่ะ',
      items: [{ code: '1.1', name: '1.1 ตัดกรอบใส (Clear Frame)', price: 10, quantity: 1 }],
      totalPrice: 10,
    }),
  });
  const dataOrder1 = await resOrder1.json();
  console.log('Order 1 Queue Number:', dataOrder1.queueNumber);
  console.log('Order 1 Transfer Note:', dataOrder1.transferNote);

  // 4. Submit Brief (Order 2) -> Generates Next Queue in sequence
  console.log('\n[4] Testing POST /api/orders (Order 2)');
  const resOrder2 = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      briefType: 'FORM_A',
      customerName: 'คุณสมชาย',
      contactPlatform: 'Facebook',
      contactId: 'somchai.gaming',
      inGameName: 'SomchaiPro',
      heroName: 'Violet',
      skinName: 'Dimension Breaker',
      rank: 'กลออันดับ 45',
      skinLevel: 'ใหม่',
      badgeType: 'เม็ด',
      badgeValue: 'เม็ดส้ม',
      powerTrait: '',
      additionalBrief: '',
      items: [{ code: '1.2', name: '1.2 ตัดหน้าโหลด (Loading)', price: 15, quantity: 1 }],
      totalPrice: 15,
    }),
  });
  const dataOrder2 = await resOrder2.json();
  console.log('Order 2 Queue Number:', dataOrder2.queueNumber);
  console.log('Order 2 Transfer Note:', dataOrder2.transferNote);

  // 5. Look up Queue 1
  console.log('\n[5] Testing GET /api/orders/' + dataOrder1.queueNumber);
  const resLookup = await fetch(`http://localhost:3000/api/orders/${dataOrder1.queueNumber}`);
  const lookup = await resLookup.json();
  console.log('Lookup Queue:', lookup.queueNumber, '| Customer:', lookup.customerName, '| Status:', lookup.status);

  // 6. Look up Points for Customer
  console.log('\n[6] Testing GET /api/points/lookup?q=' + dataOrder1.queueNumber);
  const resPoints = await fetch(`http://localhost:3000/api/points/lookup?q=${dataOrder1.queueNumber}`);
  const points = await resPoints.json();
  console.log('Customer points balance:', points.customer?.pointsBalance);
  console.log('Review eligibility (hasApprovedReview):', points.hasApprovedReview);

  // 7. Admin Login
  console.log('\n[7] Testing Admin Login with initial code 2247');
  const resLogin = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '2247' }),
  });
  const loginData = await resLogin.json();
  console.log('Login result:', loginData);

  console.log('\n--- ALL API TESTS COMPLETED SUCCESSFULLY ---');
}

runTests().catch(console.error);
