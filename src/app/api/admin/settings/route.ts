import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await prisma.settings.findMany();
  const result: Record<string, string> = {};
  settings.forEach((s) => { result[s.key] = s.value; });
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const updates = Object.entries(body) as [string, string][];

  for (const [key, value] of updates) {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  return NextResponse.json({ success: true });
}
