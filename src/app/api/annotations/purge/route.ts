import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isAdmin) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }
    await prisma.annotation.deleteMany({});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to purge annotations:', error);
    return NextResponse.json({ error: 'Failed to purge annotations' }, { status: 500 });
  }
} 