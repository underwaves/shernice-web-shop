const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, '..', 'public', 'images');
fs.mkdirSync(imgDir, { recursive: true });

// 1. Avatar SVG
const avatarSvg = `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fda4af" />
      <stop offset="50%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#be123c" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#f43f5e" flood-opacity="0.3"/>
    </filter>
  </defs>
  <rect width="400" height="400" rx="200" fill="url(#avatarGrad)" />
  <circle cx="200" cy="200" r="185" fill="#fff5f7" />
  
  <!-- Cute Face / Mascot -->
  <circle cx="200" cy="180" r="110" fill="#ffe4e6" />
  <!-- Ears -->
  <path d="M120,110 Q90,50 140,80 Z" fill="#fb7185" />
  <path d="M280,110 Q310,50 260,80 Z" fill="#fb7185" />
  <path d="M125,105 Q105,65 138,85 Z" fill="#fff" opacity="0.6" />
  <path d="M275,105 Q295,65 262,85 Z" fill="#fff" opacity="0.6" />

  <!-- Eyes with sparkle -->
  <ellipse cx="160" cy="175" rx="14" ry="18" fill="#4a044e" />
  <ellipse cx="240" cy="175" rx="14" ry="18" fill="#4a044e" />
  <circle cx="156" cy="170" r="6" fill="#ffffff" />
  <circle cx="236" cy="170" r="6" fill="#ffffff" />
  <circle cx="164" cy="182" r="3" fill="#ffffff" />
  <circle cx="244" cy="182" r="3" fill="#ffffff" />

  <!-- Blush -->
  <ellipse cx="140" cy="195" rx="16" ry="9" fill="#f43f5e" opacity="0.4" />
  <ellipse cx="260" cy="195" rx="16" ry="9" fill="#f43f5e" opacity="0.4" />

  <!-- Mouth -->
  <path d="M190,195 Q200,205 210,195" stroke="#be123c" stroke-width="4" fill="none" stroke-linecap="round" />

  <!-- Crown / Star -->
  <polygon points="200,105 208,125 230,125 212,138 218,158 200,145 182,158 188,138 170,125 192,125" fill="#facc15" filter="url(#glow)" />

  <!-- ROV text tag -->
  <rect x="130" y="310" width="140" height="40" rx="20" fill="#fb7185" />
  <text x="200" y="336" font-family="'Prompt', sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">SHERNICE ✂️</text>
</svg>`;

// 2. Cover Banner SVG
const coverSvg = `<svg width="1200" height="450" viewBox="0 0 1200 450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="coverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffe4e6" />
      <stop offset="35%" stop-color="#fecdd3" />
      <stop offset="70%" stop-color="#fda4af" />
      <stop offset="100%" stop-color="#f472b6" />
    </linearGradient>
    <pattern id="heartPattern" width="60" height="60" patternUnits="userSpaceOnUse">
      <path d="M30,25 C30,18 22,12 15,18 C8,25 20,35 30,42 C40,35 52,25 45,18 C38,12 30,18 30,25 Z" fill="#ffffff" opacity="0.18" />
    </pattern>
  </defs>
  <rect width="1200" height="450" fill="url(#coverGrad)" />
  <rect width="1200" height="450" fill="url(#heartPattern)" />
  
  <g transform="translate(600, 210)" text-anchor="middle">
    <!-- Glow effect behind text -->
    <text x="0" y="0" font-family="'Prompt', sans-serif" font-size="64" font-weight="900" fill="#ffffff" opacity="0.9" letter-spacing="4">SHERNICE ROV CUT</text>
    <text x="0" y="50" font-family="'Prompt', sans-serif" font-size="24" font-weight="500" fill="#881337" opacity="0.85">บริการตัดรูป ROV คมชัดระดับพรีเมียม สวย เป๊ะ รวดเร็ว 💖</text>
  </g>
  
  <!-- Floating decorative stars and sparkles -->
  <circle cx="150" cy="100" r="12" fill="#fff" opacity="0.7" />
  <circle cx="1050" cy="120" r="16" fill="#fff" opacity="0.7" />
  <circle cx="950" cy="320" r="20" fill="#fff" opacity="0.5" />
  <circle cx="250" cy="340" r="15" fill="#fff" opacity="0.5" />
</svg>`;

// 3. PromptPay QR SVG
const promptpayQrSvg = `<svg width="400" height="520" viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="ppGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#003d6b" />
      <stop offset="100%" stop-color="#001d36" />
    </linearGradient>
  </defs>
  <!-- Card Background -->
  <rect width="400" height="520" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- Header Bar -->
  <rect width="400" height="90" rx="24" fill="url(#ppGrad)" />
  <rect y="70" width="400" height="20" fill="url(#ppGrad)" />
  
  <text x="200" y="45" font-family="'Prompt', sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">พร้อมเพย์ PromptPay</text>
  <text x="200" y="70" font-family="'Prompt', sans-serif" font-size="13" fill="#cbd5e1" text-anchor="middle">สแกน QR เพื่อชำระเงิน</text>
  
  <!-- QR Box with Frame -->
  <rect x="50" y="115" width="300" height="300" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  
  <!-- Simulated QR Pattern -->
  <g fill="#0f172a">
    <!-- Top-Left Target -->
    <rect x="75" y="140" width="60" height="60" rx="6" />
    <rect x="85" y="150" width="40" height="40" rx="4" fill="#f8fafc" />
    <rect x="95" y="160" width="20" height="20" rx="2" />
    
    <!-- Top-Right Target -->
    <rect x="265" y="140" width="60" height="60" rx="6" />
    <rect x="275" y="150" width="40" height="40" rx="4" fill="#f8fafc" />
    <rect x="285" y="160" width="20" height="20" rx="2" />

    <!-- Bottom-Left Target -->
    <rect x="75" y="330" width="60" height="60" rx="6" />
    <rect x="85" y="340" width="40" height="40" rx="4" fill="#f8fafc" />
    <rect x="95" y="350" width="20" height="20" rx="2" />
    
    <!-- QR Data Matrix Dots -->
    <rect x="155" y="140" width="20" height="20" rx="2" />
    <rect x="195" y="140" width="20" height="20" rx="2" />
    <rect x="175" y="170" width="20" height="20" rx="2" />
    <rect x="215" y="170" width="20" height="20" rx="2" />
    <rect x="155" y="200" width="30" height="20" rx="2" />
    <rect x="215" y="200" width="30" height="20" rx="2" />
    <rect x="155" y="240" width="20" height="30" rx="2" />
    <rect x="195" y="240" width="40" height="20" rx="2" />
    <rect x="255" y="240" width="20" height="30" rx="2" />
    <rect x="155" y="290" width="30" height="20" rx="2" />
    <rect x="205" y="280" width="30" height="30" rx="2" />
    <rect x="255" y="290" width="30" height="20" rx="2" />
    <rect x="155" y="330" width="20" height="40" rx="2" />
    <rect x="195" y="340" width="40" height="20" rx="2" />
    <rect x="255" y="330" width="40" height="20" rx="2" />
    <rect x="275" y="360" width="20" height="20" rx="2" />
  </g>

  <!-- Center Icon -->
  <circle cx="200" cy="265" r="22" fill="#003d6b" stroke="#ffffff" stroke-width="3" />
  <text x="200" y="271" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">PP</text>

  <!-- Account info footer -->
  <rect x="30" y="435" width="340" height="65" rx="14" fill="#f1f5f9" />
  <text x="200" y="460" font-family="'Prompt', sans-serif" font-size="14" font-weight="bold" fill="#0f172a" text-anchor="middle">ชื่อบัญชี: น.ส.ปิ่นจุฑา ฟุ้งสกุล</text>
  <text x="200" y="483" font-family="'Prompt', sans-serif" font-size="12" fill="#64748b" text-anchor="middle">QR นี้ล็อคยอดไว้อยู่แล้ว บันทึกรูปแล้วสแกนจ่ายได้เลยค่ะ</text>
</svg>`;

// 4. KBank Card SVG
const kbankCardSvg = `<svg width="400" height="520" viewBox="0 0 400 520" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="kbankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#138f2d" />
      <stop offset="100%" stop-color="#0a591b" />
    </linearGradient>
  </defs>
  <!-- Card Background -->
  <rect width="400" height="520" rx="24" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" />
  
  <!-- Header Bar -->
  <rect width="400" height="90" rx="24" fill="url(#kbankGrad)" />
  <rect y="70" width="400" height="20" fill="url(#kbankGrad)" />
  
  <text x="200" y="45" font-family="'Prompt', sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">ธนาคารกสิกรไทย KBank</text>
  <text x="200" y="70" font-family="'Prompt', sans-serif" font-size="13" fill="#bbf7d0" text-anchor="middle">สแกนชำระเงินผ่าน K PLUS QR Code</text>
  
  <!-- QR Box with Frame -->
  <rect x="50" y="115" width="300" height="300" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  
  <!-- Simulated QR Pattern -->
  <g fill="#138f2d">
    <!-- Top-Left Target -->
    <rect x="75" y="140" width="60" height="60" rx="6" />
    <rect x="85" y="150" width="40" height="40" rx="4" fill="#f8fafc" />
    <rect x="95" y="160" width="20" height="20" rx="2" />
    
    <!-- Top-Right Target -->
    <rect x="265" y="140" width="60" height="60" rx="6" />
    <rect x="275" y="150" width="40" height="40" rx="4" fill="#f8fafc" />
    <rect x="285" y="160" width="20" height="20" rx="2" />

    <!-- Bottom-Left Target -->
    <rect x="75" y="330" width="60" height="60" rx="6" />
    <rect x="85" y="340" width="40" height="40" rx="4" fill="#f8fafc" />
    <rect x="95" y="350" width="20" height="20" rx="2" />
    
    <!-- QR Data Matrix Dots -->
    <rect x="155" y="140" width="20" height="20" rx="2" />
    <rect x="195" y="140" width="20" height="20" rx="2" />
    <rect x="175" y="170" width="20" height="20" rx="2" />
    <rect x="215" y="170" width="20" height="20" rx="2" />
    <rect x="155" y="200" width="30" height="20" rx="2" />
    <rect x="215" y="200" width="30" height="20" rx="2" />
    <rect x="155" y="240" width="20" height="30" rx="2" />
    <rect x="195" y="240" width="40" height="20" rx="2" />
    <rect x="255" y="240" width="20" height="30" rx="2" />
    <rect x="155" y="290" width="30" height="20" rx="2" />
    <rect x="205" y="280" width="30" height="30" rx="2" />
    <rect x="255" y="290" width="30" height="20" rx="2" />
    <rect x="155" y="330" width="20" height="40" rx="2" />
    <rect x="195" y="340" width="40" height="20" rx="2" />
    <rect x="255" y="330" width="40" height="20" rx="2" />
    <rect x="275" y="360" width="20" height="20" rx="2" />
  </g>

  <!-- Center Icon -->
  <circle cx="200" cy="265" r="22" fill="#138f2d" stroke="#ffffff" stroke-width="3" />
  <text x="200" y="271" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">K+</text>

  <!-- Account info footer -->
  <rect x="30" y="435" width="340" height="65" rx="14" fill="#f0fdf4" />
  <text x="200" y="460" font-family="'Prompt', sans-serif" font-size="14" font-weight="bold" fill="#166534" text-anchor="middle">ชื่อบัญชี: น.ส.ปิ่นจุฑา ฟุ้งสกุล</text>
  <text x="200" y="483" font-family="'Prompt', sans-serif" font-size="11" fill="#15803d" text-anchor="middle">ชำระผ่าน QR สแกนเท่านั้น ไม่แสดงเลขบัญชีเป็นข้อความ</text>
</svg>`;

fs.writeFileSync(path.join(imgDir, 'avatar.gif'), avatarSvg);
fs.writeFileSync(path.join(imgDir, 'avatar.svg'), avatarSvg);
fs.writeFileSync(path.join(imgDir, 'avatar.png'), avatarSvg);

fs.writeFileSync(path.join(imgDir, 'cover.gif'), coverSvg);
fs.writeFileSync(path.join(imgDir, 'cover.svg'), coverSvg);
fs.writeFileSync(path.join(imgDir, 'cover.png'), coverSvg);

fs.writeFileSync(path.join(imgDir, 'promptpay-qr.png'), promptpayQrSvg);
fs.writeFileSync(path.join(imgDir, 'kbank-card.png'), kbankCardSvg);

console.log('Public image assets created successfully!');
