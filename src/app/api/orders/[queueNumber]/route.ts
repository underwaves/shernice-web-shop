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
          { id: !isNaN(Number(rawParam)) ? Number(rawParam) : undefined },
        ],
      },
      include: {
        customer: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'ไม่พบคิวที่ระบุ' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order by queueNumber:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการค้นหาข้อมูล' }, { status: 500 });
  }
}
