import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const setting = await prisma.setting.findFirst({
      where: { id: 1 },
      select: {
        id: true,
        shopName: true,
        bio: true,
        avatarUrl: true,
        coverUrl: true,
        driveLink: true,
        statusLink: true,
        contactLink: true,
        lineId: true,
        bgMusicUrl: true,
        bgMusicEnabled: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        bgColor: true,
        cardColor: true,
        promptpayName: true,
        promptpayQrUrl: true,
        kbankName: true,
        kbankCardUrl: true,
        truemoneyName: true,
        truemoneyNumber: true,
        truemoneyFee: true,
        rewardsDescription: true,
        rewardsListJson: true,
        notes: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(setting || {});
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const updated = await prisma.setting.update({
      where: { id: 1 },
      data: {
        shopName: body.shopName,
        bio: body.bio,
        avatarUrl: body.avatarUrl,
        coverUrl: body.coverUrl,
        driveLink: body.driveLink,
        statusLink: body.statusLink,
        contactLink: body.contactLink,
        lineId: body.lineId,
        bgMusicUrl: body.bgMusicUrl,
        bgMusicEnabled: body.bgMusicEnabled,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        bgColor: body.bgColor,
        cardColor: body.cardColor,
        promptpayName: body.promptpayName,
        promptpayQrUrl: body.promptpayQrUrl,
        kbankName: body.kbankName,
        kbankCardUrl: body.kbankCardUrl,
        truemoneyName: body.truemoneyName,
        truemoneyNumber: body.truemoneyNumber,
        truemoneyFee: body.truemoneyFee !== undefined ? parseFloat(body.truemoneyFee) : undefined,
        rewardsDescription: body.rewardsDescription,
        rewardsListJson: body.rewardsListJson,
        notes: body.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SETTINGS',
        details: 'Admin updated shop settings / theme',
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
