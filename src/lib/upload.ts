import crypto from 'crypto';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export interface UploadResult {
  url: string;
  hash: string;
  fileName: string;
  size: number;
}

function getSupabaseConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  try {
    const cf = getCloudflareContext();
    if (cf?.env) {
      if ((cf.env as any).NEXT_PUBLIC_SUPABASE_URL) url = (cf.env as any).NEXT_PUBLIC_SUPABASE_URL;
      if ((cf.env as any).SUPABASE_SERVICE_ROLE_KEY) key = (cf.env as any).SUPABASE_SERVICE_ROLE_KEY;
    }
  } catch {}

  return {
    url: url || 'https://rxwzcofdmwuaurvtrvax.supabase.co',
    key: key || '',
  };
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

  const ext = file.name && file.name.includes('.')
    ? file.name.substring(file.name.lastIndexOf('.'))
    : file.type === 'image/gif'
    ? '.gif'
    : file.type === 'image/png'
    ? '.png'
    : '.jpg';

  const safeFileName = `${subFolder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

  const { url: supabaseUrl, key: serviceKey } = getSupabaseConfig();

  const uploadEndpoint = `${supabaseUrl}/storage/v1/object/uploads/${safeFileName}`;
  const res = await fetch(uploadEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error('Supabase storage upload error:', errText);
    throw new Error(`Failed to upload file to cloud storage: ${res.statusText}`);
  }

  const publicUrl = `${supabaseUrl}/storage/v1/object/public/uploads/${safeFileName}`;
  return {
    url: publicUrl,
    hash,
    fileName: safeFileName,
    size: file.size,
  };
}
