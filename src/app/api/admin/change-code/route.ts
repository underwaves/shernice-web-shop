import { NextResponse } from 'next/server';
import { isUserAdmin, setAdminPassword } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { newCode } = await request.json();
    if (!newCode || String(newCode).length < 12) {
      return NextResponse.json({ error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 12 ตัวอักษร' }, { status: 400 });
    }

    await setAdminPassword(String(newCode));

    await prisma.auditLog.create({
      data: {
        action: 'CHANGE_ADMIN_CODE',
        details: 'Admin changed access code',
      },
    });

    return NextResponse.json({ success: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
  } catch (error) {
    console.error('Error changing code:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัส' }, { status: 500 });
  }
}
