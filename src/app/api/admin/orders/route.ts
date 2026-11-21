import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      product: {
        select: { id: true, name: true, price: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(orders);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const order = await prisma.order.update({
    where: { id: body.id },
    data: { isCompleted: body.isCompleted },
  });
  return NextResponse.json(order);
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'ID required' }, { status: 400 });
  }
  await prisma.order.delete({ where: { id: parseInt(id) } });
  return NextResponse.json({ success: true });
}
