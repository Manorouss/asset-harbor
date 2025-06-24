import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET /api/login/all
// Returns: [{ id, username }, ...] for all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, username: true },
      orderBy: { username: 'asc' },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error('Failed to fetch all users:', error);
    return NextResponse.json({ message: 'Failed to fetch users' }, { status: 500 });
  }
} 