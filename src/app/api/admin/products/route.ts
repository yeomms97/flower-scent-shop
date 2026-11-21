import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      price: body.price,
      description: body.description || '',
      imageUrl: body.imageUrl || '',
      isAvailable: body.isAvailable ?? true,
    },
  });
  return NextResponse.json(product);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const updateData: any = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.price !== undefined) updateData.price = body.price;
  if (body.description !== undefined) updateData.description = body.description;
  if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;
  if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;

  const product = await prisma.product.update({
    where: { id: body.id },
    data: updateData,
  });
  return NextResponse.json(product);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  await prisma.product.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
