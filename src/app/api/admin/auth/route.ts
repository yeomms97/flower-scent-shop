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

export async function PUT(request: NextRequest) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const auth = await prisma.adminAuth.findFirst();

    if (!auth) {
      await prisma.adminAuth.create({ data: { password: newPassword } });
      return NextResponse.json({ success: true });
    }

    if (currentPassword && auth.password !== currentPassword) {
      return NextResponse.json({ error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 400 });
    }

    if (!newPassword || newPassword.trim().length === 0) {
      return NextResponse.json({ error: '새 비밀번호를 입력해주세요.' }, { status: 400 });
    }

    await prisma.adminAuth.update({
      where: { id: auth.id },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: '비밀번호 변경 실패' }, { status: 500 });
  }
}
