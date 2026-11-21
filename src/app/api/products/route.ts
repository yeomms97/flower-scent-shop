import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(products);
}
