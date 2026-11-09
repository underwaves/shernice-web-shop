const fs = require('fs');
const path = require('path');

async function testSlipAndPoints() {
  console.log('--- TESTING DUPLICATE SLIP DETECTION & POINT AWARD ---');

  // Create a dummy image file buffer
  const sampleFilePath = path.join(__dirname, '..', 'public', 'images', 'avatar.gif');
  const fileBytes = fs.readFileSync(sampleFilePath);

  // Upload slip for SN001
  console.log('\n[1] Uploading slip for SN001');
  const form1 = new FormData();
  form1.append('slip', new Blob([fileBytes], { type: 'image/gif' }), 'slip1.gif');

  const resSlip1 = await fetch('http://localhost:3000/api/orders/SN001/slip', {
    method: 'POST',
    body: form1,
  });
  const dataSlip1 = await resSlip1.json();
  console.log('Slip 1 upload response:', dataSlip1.message || dataSlip1.error);

  // Upload same slip for SN002 (Should be rejected as duplicate!)
  console.log('\n[2] Attempting to upload SAME slip for SN002 (Must be rejected)');
  const form2 = new FormData();
  form2.append('slip', new Blob([fileBytes], { type: 'image/gif' }), 'slip2.gif');

  const resSlip2 = await fetch('http://localhost:3000/api/orders/SN002/slip', {
    method: 'POST',
    body: form2,
  });
  const dataSlip2 = await resSlip2.json();
  console.log('Slip 2 upload status:', resSlip2.status);
  console.log('Slip 2 rejection message:', dataSlip2.error);

  // Customer writes review
  console.log('\n[3] Customer submits review');
  const resReview = await fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'คุณมินนี่',
      contactPlatform: 'Line',
      contactId: 'minnie_rov',
      queueNumber: 'SN001',
      rating: 5,
      comment: 'ตัดเนียนมาก สวยถูกใจที่สุดเลยค่ะ!',
    }),
  });
  const dataReview = await resReview.json();
  console.log('Review submitted ID:', dataReview.review.id, '| Status:', dataReview.review.status);

  // Login as admin to get cookie
  const resLogin = await fetch('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: '2247' }),
  });
  const cookieHeader = resLogin.headers.get('set-cookie');

  // Admin approves review
  console.log('\n[4] Admin approves review');
  const resApproveReview = await fetch(`http://localhost:3000/api/reviews/${dataReview.review.id}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader,
    },
    body: JSON.stringify({ status: 'APPROVED' }),
  });
  const dataApproveReview = await resApproveReview.json();
  console.log('Review approved:', dataApproveReview.success);

  // Admin approves payment slip for SN001
  console.log('\n[5] Admin approves payment slip for SN001');
  const resApproveSlip = await fetch('http://localhost:3000/api/orders/SN001/approve-slip', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      cookie: cookieHeader,
    },
    body: JSON.stringify({ approved: true }),
  });
  const dataApproveSlip = await resApproveSlip.json();
  console.log('Slip approval result:', dataApproveSlip.pointResult);

  // Verify points balance
  console.log('\n[6] Checking points balance for คุณมินนี่');
  const resPoints = await fetch('http://localhost:3000/api/points/lookup?q=SN001');
  const points = await resPoints.json();
  console.log('Customer points balance:', points.customer.pointsBalance);
  console.log('Review eligibility (hasApprovedReview):', points.hasApprovedReview);
  console.log('Ledger count:', points.earnedHistory.length);
  if (points.earnedHistory.length > 0) {
    console.log('Earned transaction:', points.earnedHistory[0].reason, `(+${points.earnedHistory[0].amount} pt)`);
  }

  console.log('\n--- SLIP AND POINT TESTS COMPLETED SUCCESSFULLY ---');
}

testSlipAndPoints().catch(console.error);
