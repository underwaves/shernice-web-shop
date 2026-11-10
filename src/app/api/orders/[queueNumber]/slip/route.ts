import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { saveUploadedFile } from '@/lib/upload';
import crypto from 'crypto';

export async function POST(
  request: Request,
  { params }: { params: { queueNumber: string } }
) {
  try {
    const queueNumber = decodeURIComponent(params.queueNumber).trim();

    const order = await prisma.order.findUnique({
      where: { queueNumber },
    });

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบหมายเลขคิวนี้' }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get('slip') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'กรุณาแนบรูปภาพสลิปการโอนเงิน' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPG, PNG, WEBP, GIF' }, { status: 400 });
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'ขนาดไฟล์เกินกำหนด (สูงสุด 10MB)' }, { status: 400 });
    }

    // Check the content hash before writing to disk, so rejected duplicates
    // do not leave orphaned files in the public uploads directory.
    const bytes = Buffer.from(await file.arrayBuffer());
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');

    // Prevent duplicate slip reuse: check if another order already used this slip hash!
    const existingOrderWithSlip = await prisma.order.findFirst({
      where: {
        slipHash: hash,
        id: { not: order.id },
      },
    });

    if (existingOrderWithSlip) {
      return NextResponse.json(
        {
          error: `สลิปนี้เคยถูกใช้งานในระบบแล้ว (คิว ${existingOrderWithSlip.queueNumber}) ไม่สามารถใช้สลิปซ้ำได้ค่ะ`,
        },
        { status: 400 }
      );
    }

    const uploadResult = await saveUploadedFile(file, 'slips');

    // Update order with slip info
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        slipUrl: uploadResult.url,
        slipHash: uploadResult.hash,
        slipUploadedAt: new Date(),
        // Keep status or move to waiting review if desired
      },
    });

    return NextResponse.json({
      success: true,
      message: `คิว ${order.queueNumber} ชำระเงินเรียบร้อยค่ะ`,
      order: updated,
    });
  } catch (error: any) {
    console.error('Error uploading slip:', error);
    return NextResponse.json(
      { error: error?.message || 'เกิดข้อผิดพลาดในการอัปโหลดสลิป' },
      { status: 500 }
    );
  }
}
