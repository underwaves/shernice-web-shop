import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { isUserAdmin } from '@/lib/auth';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        price: body.price !== undefined ? parseFloat(body.price) : undefined,
        description: body.description,
        footnote: body.footnote,
        exampleImagesJson: body.exampleImagesJson,
        briefType: body.briefType,
        active: body.active,
        displayOrder: body.displayOrder !== undefined ? parseInt(body.displayOrder, 10) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_PRODUCT',
        details: `Updated product ${updated.code} - ${updated.name}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const isAdmin = await isUserAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const id = parseInt(params.id, 10);
    const deleted = await prisma.product.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        action: 'DELETE_PRODUCT',
        details: `Deleted product ${deleted.code} - ${deleted.name}`,
      },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
