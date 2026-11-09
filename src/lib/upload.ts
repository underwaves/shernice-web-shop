import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface UploadResult {
  url: string;
  hash: string;
  fileName: string;
  size: number;
}

export async function saveUploadedFile(
  file: File,
  subFolder: string = 'slips',
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSizeInBytes: number = 10 * 1024 * 1024 // 10MB
): Promise<UploadResult> {
  if (!allowedTypes.includes(file.type)) {
    throw new Error('ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, WEBP, GIF');
  }

  if (file.size > maxSizeInBytes) {
    throw new Error('ขนาดไฟล์เกินกำหนด (สูงสุด 10MB)');
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Calculate SHA256 hash for slip duplication check
  const hash = crypto.createHash('sha256').update(buffer).digest('hex');

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subFolder);
  await fs.mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || (file.type === 'image/gif' ? '.gif' : '.png');
  const safeFileName = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  const filePath = path.join(uploadDir, safeFileName);

  await fs.writeFile(filePath, buffer);

  const publicUrl = `/uploads/${subFolder}/${safeFileName}`;
  return {
    url: publicUrl,
    hash,
    fileName: safeFileName,
    size: file.size,
  };
}
