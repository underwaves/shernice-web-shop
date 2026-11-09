import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const products = await prisma.product.findMany({
      where: all ? {} : { active: true },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const product = await prisma.product.create({
      data: {
        code: body.code,
        name: body.name,
        price: parseFloat(body.price),
        description: body.description || '',
        footnote: body.footnote || null,
        exampleImagesJson: body.exampleImagesJson || '[]',
        briefType: body.briefType || 'FORM_A',
        active: body.active !== undefined ? body.active : true,
        displayOrder: parseInt(body.displayOrder, 10) || 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'CREATE_PRODUCT',
        details: `Created product ${product.code} - ${product.name}`,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
