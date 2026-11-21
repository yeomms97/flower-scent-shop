import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Admin password (default: 1234)
  await prisma.adminAuth.upsert({
    where: { id: 1 },
    update: {},
    create: { password: '1234' },
  });

  // Settings
  const settings = [
    { key: 'announcement', value: '🌸 꽃향기 플라워에 오신 것을 환영합니다!\n\n신선한 꽃을 정성껏 준비합니다.\n배달 및 픽업 주문이 가능합니다.\n\n영업시간: 오전 9시 ~ 오후 8시\n문의: 051-123-4567' },
    { key: 'bank_name', value: '국민은행' },
    { key: 'bank_account', value: '123-456-789012' },
    { key: 'bank_holder', value: '김꽃집' },
  ];
  for (const s of settings) {
    await prisma.settings.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }

  // Products
  const products = [
    { name: '로즈 부케', price: 45000, description: '빨간 장미 20송이로 구성된 클래식 부케입니다.', imageUrl: '', isAvailable: true },
    { name: '혼합 꽃다발', price: 35000, description: '계절 꽃으로 구성된 화사한 혼합 꽃다발입니다.', imageUrl: '', isAvailable: true },
    { name: '카네이션 바구니', price: 55000, description: '어버이날 선물로 인기 많은 카네이션 바구니입니다.', imageUrl: '', isAvailable: true },
    { name: '프리지아 꽃다발', price: 30000, description: '향기로운 프리지아로 만든 사랑스러운 꽃다발입니다.', imageUrl: '', isAvailable: true },
    { name: '화이트 웨딩 부케', price: 80000, description: '순백의 웨딩 부케. 사전 예약 필수입니다.', imageUrl: '', isAvailable: false },
  ];

  for (const p of products) {
    const existing = await prisma.product.findFirst({ where: { name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: p });
    }
  }

  // Sample orders
  const product1 = await prisma.product.findFirst({ where: { name: '로즈 부케' } });
  const product2 = await prisma.product.findFirst({ where: { name: '혼합 꽃다발' } });
  const product3 = await prisma.product.findFirst({ where: { name: '카네이션 바구니' } });

  if (product1 && product2 && product3) {
    const orderCount = await prisma.order.count();
    if (orderCount === 0) {
      await prisma.order.createMany({
        data: [
          {
            orderType: 'delivery',
            paymentMethod: 'bank_transfer',
            customerName: '홍길동',
            customerPhone: '010-1234-5678',
            deliveryDate: '2026-11-25',
            deliveryHour: 14,
            addressCity: '부산시',
            addressDistrict: '해운대구',
            addressDong: '우동',
            addressDetail: '센텀빌딩 301호',
            request: '리본에 "축하합니다" 문구 넣어주세요',
            isCompleted: false,
            productId: product1.id,
          },
          {
            orderType: 'pickup',
            paymentMethod: 'card',
            customerName: '김영희',
            customerPhone: '010-9876-5432',
            deliveryDate: '2026-11-22',
            deliveryHour: 11,
            addressCity: '',
            addressDistrict: '',
            addressDong: '',
            addressDetail: '',
            request: '메시지 카드에 "감사합니다" 써주세요',
            isCompleted: true,
            productId: product2.id,
          },
          {
            orderType: 'delivery',
            paymentMethod: 'bank_transfer',
            customerName: '이철수',
            customerPhone: '010-5555-7777',
            deliveryDate: '2026-11-23',
            deliveryHour: 10,
            addressCity: '부산시',
            addressDistrict: '수영구',
            addressDong: '광안동',
            addressDetail: '광안리 아파트 102동 505호',
            request: '',
            isCompleted: false,
            productId: product3.id,
          },
        ],
      });
    }
  }

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
