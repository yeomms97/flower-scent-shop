import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const items = body.items && Array.isArray(body.items) && body.items.length > 0 ? body.items : null;
    const primaryProductId = items ? items[0].productId : body.productId;
    const calculatedTotal = items
      ? items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
      : (body.totalAmount || 0);

    const itemsJson = items ? JSON.stringify(items) : null;

    // Run order creation and settings fetch in parallel
    const [order, settings] = await Promise.all([
      prisma.order.create({
        data: {
          orderType: body.orderType,
          paymentMethod: body.paymentMethod || 'bank_transfer',
          customerName: body.customerName,
          customerPhone: body.customerPhone,
          deliveryDate: body.deliveryDate,
          deliveryHour: body.deliveryHour,
          addressCity: body.addressCity || '',
          addressDistrict: body.addressDistrict || '',
          addressDong: body.addressDong || '',
          addressDetail: body.addressDetail || '',
          request: body.request || '',
          productId: primaryProductId,
          itemsJson: itemsJson,
          totalAmount: calculatedTotal,
        },
        include: {
          product: {
            select: { id: true, name: true, price: true },
          },
        },
      }),
      prisma.settings.findMany({
        where: { key: { in: ['bank_name', 'bank_account', 'bank_holder'] } },
      }),
    ]);

    const bankInfo: Record<string, string> = {};
    settings.forEach((s) => { bankInfo[s.key] = s.value; });

    return NextResponse.json({ order, bankInfo });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');
  const phoneLast4 = searchParams.get('phone');

  if (!name || !phoneLast4) {
    return NextResponse.json({ error: 'Name and phone required' }, { status: 400 });
  }

  const orders = await prisma.order.findMany({
    where: {
      customerName: name,
      customerPhone: { endsWith: phoneLast4 },
    },
    include: {
      product: {
        select: { id: true, name: true, price: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(orders);
}
