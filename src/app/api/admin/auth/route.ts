import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const auth = await prisma.adminAuth.findFirst();

  if (!auth) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 });
  }

  if (auth.password === password) {
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
