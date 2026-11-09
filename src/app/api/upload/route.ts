import { NextResponse } from 'next/server';
import { saveUploadedFile } from '@/lib/upload';
import { isUserAdmin } from '@/lib/auth';

export async function POST(request: Request) {
  // Allow file uploads: slips can be uploaded by clients, profile/theme/products by admin
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'general';

    if (!file) {
      return NextResponse.json({ error: 'ไม่พบไฟล์ที่ต้องการอัปโหลด' }, { status: 400 });
    }

    // If uploading to admin-controlled folders, verify admin status
    if (folder !== 'slips') {
      const isAdmin = await isUserAdmin();
      if (!isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'audio/mpeg',
      'audio/mp3',
      'audio/ogg',
      'audio/wav',
    ];

    const result = await saveUploadedFile(file, folder, allowedTypes, 15 * 1024 * 1024);

    return NextResponse.json({
      success: true,
      url: result.url,
      fileName: result.fileName,
      size: result.size,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' },
      { status: 500 }
    );
  }
}
