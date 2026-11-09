import { NextResponse } from 'next/server';
import { checkAdminPassword, createToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: 'กรุณากรอกรหัสผ่าน' }, { status: 400 });
    }

    const isValid = await checkAdminPassword(String(code).trim());
    if (!isValid) {
      return NextResponse.json({ error: 'รหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const token = createToken(String(code));
    const response = NextResponse.json({ success: true, message: 'เข้าสู่ระบบสำเร็จ' });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    await prisma.auditLog.create({
      data: {
        action: 'ADMIN_LOGIN',
        details: 'Admin logged in successfully',
      },
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
