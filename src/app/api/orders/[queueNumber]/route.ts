import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  _request: Request,
  { params }: { params: { queueNumber: string } }
) {
  try {
    const rawParam = decodeURIComponent(params.queueNumber).trim();

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { queueNumber: { equals: rawParam } },
          { queueNumber: { equals: rawParam.toUpperCase() } },
          ...(!isNaN(Number(rawParam)) ? [{ id: Number(rawParam) }] : []),
        ],
      },
      select: {
        queueNumber: true,
        customerName: true,
        status: true,
        totalPrice: true,
        transferNote: true,
        slipApproved: true,
        slipUrl: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบคิวที่ระบุ' }, { status: 404 });
    }

    // This endpoint is public because customers use it to check queues and pay.
    // Return only the fields those screens need; never expose contacts, briefs, or slip files.
    const { slipUrl, ...safeOrder } = order;
    return NextResponse.json({ ...safeOrder, hasSlip: Boolean(order.slipUrl) });
  } catch (error) {
    console.error('Error fetching order by queueNumber:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' }, { status: 500 });
  }
}
